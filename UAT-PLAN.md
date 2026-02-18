# FieldForge Automated UAT Plan

## Overview
Jimmy runs automated tests after every deployment to verify:
- Backend APIs work correctly
- Frontend UI functions properly
- Database records persist correctly
- No regressions from changes

## Testing Trigger
Run UAT when:
- ✅ Bret says "test this" or "run UAT"
- ✅ New feature is deployed
- ✅ Bug fix is pushed to production
- ✅ Bret mentions specific edits to test

## Test Sequence

### Phase 1: Pre-Test Checks (30 seconds)
```bash
# Check latest commit
gh api repos/bretel-hub/fieldforge/commits/main

# Verify code is pushed
git status

# Confirm deployment timestamp
vercel ls --yes | head -n 5
```

### Phase 2: Backend API Tests (2 minutes)
Run: `tests/test-proposals-api.ps1`

**Tests:**
- ✅ POST /api/proposals (create proposal)
- ✅ GET /api/proposals (list proposals)
- ✅ GET /api/proposals/:id (single proposal)
- ✅ Verify response structure
- ✅ Check status codes (200/201/400/500)

**Pass criteria:**
- All endpoints return 200/201
- Data structure matches expected format
- No server errors in response

### Phase 3: Frontend UI Tests (5 minutes)
Use browser automation (OpenClaw browser tool with `profile="openclaw"`)

**IMPORTANT:** Always use `profile="openclaw"` for automated testing. This launches an isolated browser that requires no manual attachment. Never use `profile="chrome"` for UAT - it requires manual tab connection.

**Test Flow:**
1. **Navigate** → https://fieldforge-eight.vercel.app/proposals/create
2. **Screenshot** → "01-initial-page-load.png"
3. **Fill customer info:**
   - Company Name: "UAT Test Co"
   - Contact: "Jane Doe"
   - Email: "jane@uattest.com"
   - Address: "123 UAT Street"
4. **Fill project details:**
   - Title: "UAT Test Project"
   - Description: "Automated test project"
   - Location: "Test Site"
   - Timeline: "2 weeks"
5. **Add line items:**
   - Item 1: Labor, 10 hrs @ $150 = $1,500
   - Item 2: Materials, 5 units @ $200 = $1,000
6. **Verify calculations:**
   - Subtotal: $2,500.00
   - Tax (8.75%): $218.75
   - Total: $2,718.75
7. **Screenshot** → "02-form-complete.png"
8. **Click "Save as Draft"**
9. **Verify redirect** → /proposals page
10. **Screenshot** → "03-proposals-list.png"
11. **Check console** for errors

**Pass criteria:**
- All fields accept input
- Calculations correct
- Save button works
- Redirect happens
- New proposal appears in list
- No console errors

### Phase 4: Database Verification (1 minute)
Check Supabase directly

**Verification:**
1. Open Supabase Table Editor
2. Check `proposals` table for new record
3. Verify all fields populated correctly
4. Check `proposal_line_items` table for line items
5. Verify foreign key relationships

**Pass criteria:**
- Record exists in database
- All fields match form input
- Line items linked correctly
- Timestamps set properly

### Phase 5: Feature-Specific Tests
When Bret provides specific edits to test:

**Template:**
1. **What changed:** [Brief description of the edit]
2. **Expected behavior:** [What should happen]
3. **Test steps:** [Specific actions to verify]
4. **Pass criteria:** [How to know it works]

## Reporting Format

### Success Report
```
✅ UAT PASSED - [Feature Name]
Commit: [hash] - [message]
Deployment: [timestamp]
Duration: [X minutes]

Backend: ✅ All APIs responding
Frontend: ✅ UI functional, no errors
Database: ✅ Data persisted correctly

Screenshots: [links]
```

### Failure Report
```
❌ UAT FAILED - [Feature Name]
Commit: [hash] - [message]
Deployment: [timestamp]

Failed Tests:
- [Test name]: [Error description]
- [Test name]: [Error description]

Logs: [relevant error logs]
Screenshots: [links]

Recommended Action: [fix suggestion]
```

## Automation Scripts

### Quick Test Command
**For Bret to use:**
"Run UAT on the proposals page"

**Jimmy will:**
1. Check latest deployment
2. Run backend API tests
3. Run frontend UI tests
4. Verify database
5. Report results with screenshots

### Manual Test Command
**For Bret to use:**
"Test [specific feature] - it should [expected behavior]"

**Jimmy will:**
1. Focus testing on that feature
2. Document what was tested
3. Report pass/fail with evidence

## Test Data Cleanup
After each test run:
- ⚠️ **DO NOT delete test records** - keep for debugging
- Mark test proposals with "UAT Test" in title
- Can clean up old test data weekly if needed

## Screenshot Storage
Save screenshots to: `fieldforge/tests/screenshots/YYYY-MM-DD-[test-name]/`

## Issue Creation
If test fails:
1. Create GitHub issue via `gh` CLI
2. Include:
   - Error description
   - Steps to reproduce
   - Screenshots
   - Commit hash
   - Expected vs actual behavior
3. Assign to Bret (if possible)
4. Label: "bug", "UAT-failed"

---

## Ready to Test!

**Current test:** Proposal creation flow (baseline)
**Next test:** Bret's edits to proposal page

Tell me when you're ready to run the first automated UAT!
