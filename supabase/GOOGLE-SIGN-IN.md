# Finish Google sign-in for this website

The Supabase database, private storage, deletion function, and return URLs are configured. Google still needs an OAuth client owned by your Google Cloud account.

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview). Select or create a project for **I Love Free Compressor**.
2. Configure the app name, support/contact email, and an **External** audience. Use only `openid`, email, and profile scopes. If the app is in testing mode, add your own Google email as a test user.
3. Open [Create OAuth client](https://console.cloud.google.com/auth/clients/create). Choose **Web application**.
4. Add these authorized JavaScript origins:

```text
https://ilovefreecompressor.vercel.app
https://kathirvelm387.github.io
```

5. Add this authorized redirect URI exactly:

```text
https://eekqsemvydatdsnvddge.supabase.co/auth/v1/callback
```

6. Create the client. Enter its **Client ID** and **Client Secret** directly in [Supabase's Google provider settings](https://supabase.com/dashboard/project/eekqsemvydatdsnvddge/auth/providers?provider=Google), enable Google, and save. Keep the secret out of Git and chat.
7. Open [the website's account page](https://ilovefreecompressor.vercel.app/#/account), choose **Check again**, then **Continue with Google**. Use the email preapproved as admin. The Admin tab appears after verified sign-in.

Publish the Google OAuth app when ready for public users, following Google's consent-screen requirements.

Reference: [Supabase's official Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).
