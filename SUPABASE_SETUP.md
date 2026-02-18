# Supabase Setup - Final Step

## ✅ Already Done:
- Database created on Supabase
- Environment variables configured in Vercel
- Supabase client installed
- API routes updated to use Supabase
- Code committed and pushed

## 🎯 Last Step: Create Tables

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/wxnrlzrtnkwjtpjifvyj/sql/new
   - (Or click "SQL Editor" in the left sidebar)

2. **Copy the schema**:
   - Open `db/schema.sql` in your project
   - Copy ALL the content

3. **Paste and Run**:
   - Paste the schema into the SQL Editor
   - Click the **"Run"** button (or press CTRL+Enter)
   - You should see "Success. No rows returned"

4. **Verify**:
   - Click "Table Editor" in the left sidebar
   - You should see 3 new tables:
     - `customers`
     - `proposals`
     - `proposal_line_items`

## 🚀 Test It!

Once the tables are created:
1. Go to https://fieldforge-eight.vercel.app/proposals/create
2. Fill out the form and add some line items
3. Click **"Save as Draft"**
4. You should be redirected to `/proposals` 
5. Check Supabase Table Editor to see your saved proposal!

## Troubleshooting

If you get an error, make sure:
- You copied the ENTIRE schema.sql file
- You clicked "Run" after pasting
- There are no syntax errors shown in red

The schema is safe to run multiple times (it uses `IF NOT EXISTS`).
