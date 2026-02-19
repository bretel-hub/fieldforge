# Supabase Setup - Final Step

## Already Done:
- Database created on Supabase
- Environment variables configured in Vercel
- Supabase client installed
- API routes updated to use Supabase
- Code committed and pushed

## Last Step: Create Tables

### Fresh Setup (no tables yet)

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
   - You should see 5 tables:
     - `customers`
     - `proposals`
     - `proposal_line_items`
     - `partners`
     - `partner_costs`

### Existing Setup (already have customers/proposals tables, missing partners)

If you set up the database before the Partners feature was added, run only the partners migration:

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/wxnrlzrtnkwjtpjifvyj/sql/new

2. **Copy and run the partners migration**:
   - Open `db/migrations/001_add_partners.sql`
   - Copy all the content, paste into SQL Editor, and click **"Run"**

3. **Verify**:
   - Click "Table Editor" and confirm `partners` and `partner_costs` tables now appear

## Test It!

Once the tables are created:
1. Go to https://fieldforge-eight.vercel.app/partners/create
2. Fill out the partner form
3. Click **"Save Partner"**
4. You will be redirected to `/partners` and see the new partner in the list

## Troubleshooting

If you get "Could not find the table 'public.partners' in the schema cache":
- The `partners` table has not been created in your Supabase project yet
- Follow the "Existing Setup" steps above to run `db/migrations/001_add_partners.sql`
- The schema is safe to run multiple times (it uses `IF NOT EXISTS`)

If you get an error running the schema:
- Make sure you copied the ENTIRE file
- Make sure you clicked "Run" after pasting
- Check for any red syntax error indicators
