# UI Testing Workflow (Browser Automation)

This document outlines the browser automation steps for testing the FieldForge UI.

## Prerequisites
- OpenClaw browser extension relay connected (Chrome profile)
- Target: https://fieldforge-eight.vercel.app

## Test: Create Proposal Flow

### 1. Navigate to Create Proposal Page
```
browser -> open -> https://fieldforge-eight.vercel.app/proposals/create
```

### 2. Take Initial Screenshot
```
browser -> screenshot -> save as "01-create-page-loaded.png"
```

### 3. Fill Customer Information
```
- Click into "Company Name" field
- Type "UAT Test Company"
- Click into "Contact Person" field  
- Type "John Doe"
- Click into "Email" field
- Type "john@uattest.com"
- Click into "Address" field
- Type "123 Test Street, Test City, TS 12345"
```

### 4. Fill Project Details
```
- Click into "Project Title" field
- Type "UAT Test Project"
- Click into "Description" field
- Type "This is an automated UAT test project"
- Click into "Location" field
- Type "Test Location"
- Click into "Timeline" field
- Type "2 weeks"
```

### 5. Add First Line Item
```
- Click "Add Line Item" button
- Select category: "Labor"
- Type description: "Installation work"
- Set quantity: 10
- Set unit price: 150
- Verify total calculates to $1,500
```

### 6. Add Second Line Item
```
- Click "Add Line Item" button
- Select category: "Materials"
- Type description: "Hardware supplies"
- Set quantity: 5
- Set unit price: 200
- Verify total calculates to $1,000
```

### 7. Verify Totals
```
- Check Subtotal: $2,500.00
- Check Tax (8.75%): $218.75
- Check Total: $2,718.75
```

### 8. Take Screenshot Before Save
```
browser -> screenshot -> save as "02-form-filled-complete.png"
```

### 9. Save as Draft
```
- Click "Save as Draft" button
- Wait for redirect to /proposals page
- Verify success (URL changed)
```

### 10. Verify on Proposals List
```
browser -> snapshot
- Verify new proposal appears in list
- Check proposal number matches
- Check customer name displays
- Check total displays correctly
```

### 11. Take Final Screenshot
```
browser -> screenshot -> save as "03-proposals-list-with-new.png"
```

## Automated Test Script (OpenClaw Commands)

```javascript
// Use OpenClaw browser tool with these steps
// Example execution in chat:
// "Test the proposal creation UI flow end-to-end and take screenshots at each major step"
```

## Expected Results

✅ All fields accept input  
✅ Line item totals calculate correctly  
✅ Subtotal/tax/total calculate correctly  
✅ Save button triggers API call  
✅ Success redirect to /proposals  
✅ New proposal appears in list  
✅ No console errors  
✅ No visual glitches

## Failure Modes to Check

❌ 405/404 API errors  
❌ Silent failures (no feedback)  
❌ Incorrect calculations  
❌ Data not persisting  
❌ UI freezing/hanging  
❌ Validation errors not shown

---

## Quick Test Command

**For Jimmy (me) to run:**

```
Test the FieldForge proposal creation flow:
1. Open /proposals/create
2. Fill all fields with test data
3. Add 2 line items
4. Verify calculations
5. Save and verify it appears in the list
6. Take screenshots at: initial load, form complete, saved list
```
