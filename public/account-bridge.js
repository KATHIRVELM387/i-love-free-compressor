// Results never leave this module until the user explicitly chooses Save.
export const results = new Map();
let preferences = {};
export const getPreferences = () => preferences;
export function setPreferences(value = {}) { preferences = value; }
export function registerResult(id, blob, tool) {
  results.set(id, { blob, tool });
  window.dispatchEvent(new CustomEvent('account-result', { detail: { id, tool, bytes: blob.size } }));
}
export function forgetResult(id) {
  results.delete(id);
  document.getElementById(id + '-save')?.remove();
}
export function forgetToolResults(tool) {
  for (const [id, result] of results) if (result.tool === tool) forgetResult(id);
}
