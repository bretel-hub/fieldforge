# Troubleshooting Save Issue

## What I Did While You Were Away:

1. **Added Debug Logging**
   - API route now logs every step to help identify where it's failing
   - Added `/api/test` endpoint to check if environment variables are set

2. **Deployed Changes**
   - Latest commit: `ca5edc2`
   - Should be live in ~2 minutes

## Next Steps When You Return:

### 1. Check Test Endpoint
Visit: https://fieldforge-eight.vercel.app/api/test

Should see:
```json
{
  "supabaseUrl": "SET",
  "supabaseKey": "SET",
  "timestamp": "..."
}
```

If either shows "MISSING", we need to add environment variables to Vercel.

### 2. Try Save Again With Console Open
1. Open browser Dev Tools (F12)
2. Go to Console tab
3. Try saving a proposal
4. Look for `[API]` log messages showing what's happening

### 3. Check Vercel Logs
If API logs aren't showing in browser:
1. Go to https://vercel.com/brets-projects-4cb03dc7/fieldforge/logs
2. Filter by "Runtime Logs"
3. Try saving again
4. Check for errors

## Common Issues & Fixes:

### Issue: Environment variables not set
**Fix**: Go to Vercel → Settings → Environment Variables → Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(These should already be there from the Supabase integration, but double-check)

### Issue: CORS error
**Fix**: Need to enable CORS in Supabase or add API route config

### Issue: Supabase RLS (Row Level Security)
**Fix**: Tables might have RLS enabled blocking inserts. Need to add policy.

---

Tell me what you see from the test endpoint and console, and I'll fix it!
