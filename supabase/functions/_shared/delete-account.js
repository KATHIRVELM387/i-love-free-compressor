// The browser never supplies a trusted user id. Auth validates the bearer token,
// and database state blocks new saves before storage/auth cleanup begins.
export function deleteAccountHandler({ createClient, url, publicKey, serviceKey, allowedOrigins }) {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info';
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    }
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowedOrigins.includes(origin)) return reply(403, { error: 'Origin not allowed.' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply(405, { error: 'Use POST.' });
    const authorization = request.headers.get('authorization') || '';
    if (!/^Bearer \S+$/i.test(authorization)) return reply(401, { error: 'Sign in first.' });
    if (!url || !publicKey || !serviceKey) return reply(503, { error: 'Account deletion is not configured yet.' });
    try {
      // Bound streamed bodies too; Content-Length alone is not trustworthy.
      const reader = request.body?.getReader(); let text = '', bytes = 0;
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          bytes += value.byteLength;
          if (bytes > 1024) { await reader.cancel(); return reply(413, { error: 'Request too large.' }); }
          text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
      }
      let body; try { body = JSON.parse(text); } catch { return reply(400, { error: 'Invalid request.' }); }
      if (body?.confirmation !== 'DELETE') return reply(400, { error: 'Type DELETE to confirm.' });
      const userApi = createClient(url, publicKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
      const identity = await userApi.auth.getUser(authorization.slice(7));
      const id = identity.data?.user?.id;
      if (identity.error || !/^[0-9a-f-]{36}$/i.test(id || '')) return reply(401, { error: 'Your sign-in expired. Sign in again.' });
      const freeze = await userApi.rpc('begin_account_deletion');
      if (freeze.error) return reply(409, { error: freeze.error.message.includes('another active administrator') ? 'Assign another active administrator before deleting your account.' : 'Could not start deletion. Please try again.' });
      const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const bucket = service.storage.from('account-files');
      // Always list from offset 0: deleting a page shifts later objects forward.
      for (let page = 0; page < 20; page++) {
        const listed = await bucket.list(id, { limit: 1000, offset: 0 });
        if (listed.error) throw new Error('Storage listing failed');
        if (!listed.data.length) break;
        const paths = listed.data.map(file => {
          if (!/^[0-9a-f-]{36}$/i.test(file.name)) throw new Error('Unexpected object path');
          return `${id}/${file.name}`;
        });
        const removed = await bucket.remove(paths); if (removed.error) throw new Error('Storage removal failed');
        if (page === 19) throw new Error('Cleanup limit reached');
      }
      const removed = await service.auth.admin.deleteUser(id);
      if (removed.error) throw new Error('Auth removal failed');
      return reply(200, { deleted: true });
    } catch {
      return reply(503, { error: 'Deletion could not finish. Your account may be pending deletion; retry from Settings to complete cleanup.' });
    }
  };
}
