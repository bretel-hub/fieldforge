# FieldForge Proposals API Test Script
# Usage: .\tests\test-proposals-api.ps1

$base = "https://fieldforge-eight.vercel.app"

Write-Host "Testing FieldForge Proposals API" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Proposal (POST)
Write-Host "Test 1: Create new proposal..." -ForegroundColor Yellow
$createBody = @{
    customer = @{
        name = "UAT Test Company $(Get-Date -Format 'HHmmss')"
        contact = "Jane Smith"
        email = "jane@uattest.com"
        address = "456 UAT Ave"
    }
    projectDetails = @{
        title = "UAT Test Project"
        description = "Automated UAT test"
        location = "Test Site"
        timeline = "2 weeks"
    }
    items = @(
        @{
            category = "Labor"
            description = "Test labor item"
            quantity = 5
            unitPrice = 100
            total = 500
        },
        @{
            category = "Materials"
            description = "Test materials"
            quantity = 10
            unitPrice = 50
            total = 500
        }
    )
    subtotal = 1000
    tax = 87.50
    total = 1087.50
    status = "draft"
} | ConvertTo-Json -Depth 10

try {
    $createResult = Invoke-RestMethod -Uri "$base/api/proposals" -Method POST -Body $createBody -ContentType "application/json"
    
    if ($createResult.success) {
        Write-Host "[PASS] Proposal created successfully!" -ForegroundColor Green
        Write-Host "   Proposal ID: $($createResult.proposal.id)" -ForegroundColor Gray
        Write-Host "   Proposal Number: $($createResult.proposal.proposal_number)" -ForegroundColor Gray
        $proposalId = $createResult.proposal.id
    } else {
        Write-Host "[FAIL] Failed to create proposal: $($createResult.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] API Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get All Proposals (GET)
Write-Host "Test 2: Fetch all proposals..." -ForegroundColor Yellow
try {
    $getResult = Invoke-RestMethod -Uri "$base/api/proposals" -Method GET
    
    if ($getResult.success) {
        Write-Host "[PASS] Fetched $($getResult.proposals.Count) proposals" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Failed to fetch proposals" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] API Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Single Proposal (GET)
Write-Host "Test 3: Fetch single proposal by ID..." -ForegroundColor Yellow
try {
    $singleResult = Invoke-RestMethod -Uri "$base/api/proposals/$proposalId" -Method GET
    
    if ($singleResult.success) {
        Write-Host "[PASS] Fetched proposal: $($singleResult.proposal.proposal_number)" -ForegroundColor Green
        Write-Host "   Customer: $($singleResult.proposal.customer_name)" -ForegroundColor Gray
        Write-Host "   Total: `$$($singleResult.proposal.total)" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Failed to fetch proposal" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] API Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== UAT Test Complete ===" -ForegroundColor Cyan
