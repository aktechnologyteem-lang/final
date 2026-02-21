
# Email Verification Dashboard

A professional SaaS-style dashboard for bulk email cleaning.

## Features
- **Bulk Processing:** Paste hundreds of emails or upload a CSV.
- **Real-time Stats:** Track valid, invalid, and risky counts instantly.
- **Professional UI:** Dark/Light mode, smooth animations, and responsive card layout.
- **Exporting:** Download cleaned lists as CSV or copy valid emails to clipboard.

## How to use
1. Click the **Settings** (gear) icon in the header.
2. Enter your **Apify API Token** (find it in your Apify Console).
3. Paste emails or upload a file.
4. Click **Verify Emails**.

## Deployment Instructions

### Frontend (Netlify / Vercel)
1. Push this code to a GitHub repository.
2. Connect your repository to Netlify or Vercel.
3. Set the build command to `npm run build` and publish directory to `dist`.

### Backend Proxy (Recommended for Production)
1. Deploy the `proxy.js` logic to a Node.js host (like Render or Vercel Serverless).
2. Set your `APIFY_TOKEN` as an environment variable on the host.
3. Update the `apifyService.ts` file in the frontend to call your new proxy URL.

## Security Warning
This frontend-only demo stores the API token in `localStorage`. For production apps, always use the provided proxy server example to prevent exposing your token to the public.
