# Database Setup for FieldForge

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/brets-projects-4cb03dc7/fieldforge
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres** (powered by Neon)
5. Choose a name: `fieldforge-db`
6. Select region closest to you
7. Click **Create**

## Step 2: Connect Database to Project

Vercel will automatically add environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 3: Run Schema Migration

Once the database is created, run the schema:

```bash
# Copy the POSTGRES_URL from Vercel dashboard
# Then run:
psql "YOUR_POSTGRES_URL_HERE" -f db/schema.sql
```

Or use the Vercel dashboard SQL editor:
1. Go to **Storage** → Your database → **Query**
2. Copy/paste the contents of `db/schema.sql`
3. Click **Run Query**

## Step 4: Deploy

The code is ready! Just deploy:

```bash
git add .
git commit -m "Add database integration for proposals"
git push origin main
```

Vercel will automatically deploy with the database connected.

## Testing Locally

To test locally, create a `.env.local` file:

```env
POSTGRES_URL="your-postgres-url-from-vercel"
```

Then run:

```bash
npm run dev
```

## What's Working Now

✅ **Save as Draft** - Saves proposal to database
✅ **Send Proposal** - Saves with "sent" status
✅ API routes for CRUD operations
✅ Database schema with proposals and line items
✅ Auto-generated proposal numbers

## Next Steps

After database is set up:
- [ ] Build Preview modal
- [ ] Update Proposals list page to fetch from DB
- [ ] Add Edit functionality
- [ ] Build customer-facing proposal view
- [ ] Add email delivery
