# FieldForge UAT Testing Guide

## Testing Workflow

### 1. Backend API Testing (First)
Test API endpoints directly before touching the UI.

**Tools:**
- PowerShell `Invoke-RestMethod`
- Browser DevTools Console
- Direct curl/fetch calls

**Endpoints to test:**
```powershell
# Base URL
$base = "https://fieldforge-eight.vercel.app"

# Test POST /api/proposals
$body = @{
    customer = @{
        name = "Test Company"
        contact = "John Doe"
        email = "john@test.com"
        address = "123 Test St"
    }
    projectDetails = @{
        title = "Test Project"
        description = "Test Description"
        location = "Test Location"
        timeline = "1 week"
    }
    items = @(
        @{
            category = "Labor"
            description = "Test item"
            quantity = 1
            unitPrice = 100
            total = 100
        }
    )
    subtotal = 100
    tax = 8.75
    total = 108.75
    status = "draft"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "$base/api/proposals" -Method POST -Body $body -ContentType "application/json"

# Test GET /api/proposals
Invoke-RestMethod -Uri "$base/api/proposals" -Method GET

# Test GET /api/proposals/:id
Invoke-RestMethod -Uri "$base/api/proposals/{proposal-id}" -Method GET
```

### 2. Frontend UI Testing (Second)
Test user interactions and UI flows.

**Browser Testing via OpenClaw:**
- Use Chrome extension relay (profile="chrome")
- Automated click/type/screenshot flows
- Visual verification

**Test Scenarios:**
1. Create new proposal (happy path)
2. Edit existing proposal
3. Add/remove line items
4. Calculate totals correctly
5. Save as draft
6. Send proposal
7. Error handling (empty fields, network errors)

### 3. Database Verification (Third)
Verify data persistence in Supabase.

**Supabase Dashboard:**
- Check Table Editor for new records
- Verify foreign keys and relationships
- Check timestamps (created_at, updated_at)

**Direct SQL queries:**
```sql
-- Check recent proposals
SELECT * FROM proposals ORDER BY created_at DESC LIMIT 5;

-- Check line items
SELECT * FROM proposal_line_items WHERE proposal_id = 'uuid-here';

-- Verify totals match
SELECT 
  p.proposal_number,
  p.subtotal,
  p.tax_amount,
  p.total,
  SUM(li.total) as calculated_subtotal
FROM proposals p
LEFT JOIN proposal_line_items li ON p.id = li.proposal_id
GROUP BY p.id;
```

## UAT Checklist Template

### Feature: [Feature Name]
**Date:** YYYY-MM-DD  
**Tester:** Jimmy  
**Branch:** main  
**Deployment:** https://fieldforge-eight.vercel.app

#### Backend Tests
- [ ] API endpoint responds (not 404/405)
- [ ] Returns correct status codes (200/201/400/500)
- [ ] Request validation works
- [ ] Database records created
- [ ] Response structure matches expected format
- [ ] Error handling works (bad data, missing fields)

#### Frontend Tests
- [ ] UI renders correctly
- [ ] Form inputs work
- [ ] Buttons trigger correct actions
- [ ] Loading states display
- [ ] Success messages show
- [ ] Error messages show
- [ ] Redirects work after actions
- [ ] Data persists after refresh

#### Database Tests
- [ ] Records exist in correct tables
- [ ] Foreign keys link properly
- [ ] Timestamps set correctly
- [ ] Data types match schema
- [ ] Constraints enforced (NOT NULL, UNIQUE)

#### Edge Cases
- [ ] Empty form submission
- [ ] Very long text inputs
- [ ] Special characters in inputs
- [ ] Concurrent requests
- [ ] Network timeout handling

---

## Automation Scripts

Create test scripts in `tests/` directory for repeated testing.

### Example: Quick Backend Test
```bash
# tests/backend-proposals.sh
curl -X POST https://fieldforge-eight.vercel.app/api/proposals \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"UAT Test"},"projectDetails":{"title":"Auto Test"},"items":[],"subtotal":0,"tax":0,"total":0,"status":"draft"}'
```

### Example: Browser Automation
Use OpenClaw browser tool for UI testing (see browser commands in test-ui.md).

---

## When to Run UAT

**Always test after:**
- ✅ Pushing new features to production
- ✅ Database schema changes
- ✅ API route modifications
- ✅ UI component updates

**Test sequence:**
1. Backend API (prove it works)
2. Frontend UI (prove it connects)
3. Database (prove it persists)
4. Notify Bret for manual verification
