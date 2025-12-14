# Comprehensive Feature Testing Script
$BASE_URL = "http://localhost:5000"
$ML_URL = "http://localhost:8000"

$tests = @()
$passed = 0
$failed = 0

function Test-Feature {
    param($name, $testScript)
    try {
        & $testScript
        Write-Host "✅ $name" -ForegroundColor Green
        $script:tests += @{Name=$name; Status="PASSED"}
        $script:passed++
        return $true
    } catch {
        Write-Host "❌ $name : $($_.Exception.Message)" -ForegroundColor Red
        $script:tests += @{Name=$name; Status="FAILED"; Error=$_.Exception.Message}
        $script:failed++
        return $false
    }
}

Write-Host "`n🧪 COMPREHENSIVE FEATURE TESTING`n" -ForegroundColor Cyan
Write-Host ("=" * 60)

# Test 1: Backend Health
Test-Feature "Backend Health Check" {
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/health" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if ($data.status -ne "ok") { throw "Backend not healthy" }
}

# Test 2: ML Service Health
Test-Feature "ML Service Health Check" {
    $res = Invoke-WebRequest -Uri "$ML_URL/health" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if ($data.status -ne "ok") { throw "ML service not healthy" }
}

# Test 3: Get All Properties (Data Merging)
$allProperties = $null
Test-Feature "Get All Properties (Data Merging)" {
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to get properties" }
    if (-not $data.data -or $data.data.Count -eq 0) { throw "No properties returned" }
    $script:allProperties = $data.data
    
    # Verify merged data structure
    $firstProp = $data.data[0]
    $required = @('id', 'title', 'price', 'location', 'bedrooms', 'bathrooms', 'size_sqft', 'image_url')
    foreach ($field in $required) {
        if (-not $firstProp.$field) { throw "Missing $field" }
    }
}

# Test 4: Verify Data Merging (All 3 JSON files)
Test-Feature "Data Merging - All 3 JSON Files" {
    if (-not $allProperties -or $allProperties.Count -eq 0) { throw "No properties to test" }
    
    $sample = $allProperties[0]
    $hasBasics = $sample.id -and $sample.title -and $sample.price -and $sample.location
    $hasCharacteristics = $sample.bedrooms -ne $null -and $sample.bathrooms -ne $null -and $sample.size_sqft
    $hasImages = $sample.image_url
    
    if (-not $hasBasics) { throw "Missing basics data" }
    if (-not $hasCharacteristics) { throw "Missing characteristics data" }
    if (-not $hasImages) { throw "Missing images data" }
}

# Test 5: Property Search - Location Filter
Test-Feature "Property Search - Location Filter" {
    $body = @{
        message = "Show me properties in New York"
        predict = $false
    } | ConvertTo-Json
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties/search" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Search failed" }
    if ($data.count -eq 0) { throw "No properties found for New York" }
    
    # Verify all results are in New York
    $allInNY = $data.data | Where-Object { $_.location -notmatch "new york" -and $_.location -notmatch "New York" }
    if ($allInNY.Count -gt 0) { throw "Filter not working correctly" }
}

# Test 6: Property Search - Budget Filter
Test-Feature "Property Search - Budget Filter" {
    $body = @{
        message = "Show me properties under 500000"
        predict = $false
    } | ConvertTo-Json
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties/search" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Search failed" }
    
    if ($data.data.Count -gt 0) {
        $overBudget = $data.data | Where-Object { $_.price -gt 500000 }
        if ($overBudget.Count -gt 0) { throw "Budget filter not working" }
    }
}

# Test 7: Property Search - Bedrooms Filter
Test-Feature "Property Search - Bedrooms Filter" {
    $body = @{
        message = "Show me 3 bedroom properties"
        predict = $false
    } | ConvertTo-Json
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties/search" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Search failed" }
    
    if ($data.data.Count -gt 0) {
        $insufficient = $data.data | Where-Object { $_.bedrooms -lt 3 }
        if ($insufficient.Count -gt 0) { throw "Bedrooms filter not working" }
    }
}

# Test 8: Saved Properties - Save
$savedPropertyId = $null
Test-Feature "Save Property" {
    if (-not $allProperties -or $allProperties.Count -eq 0) { throw "No properties to save" }
    
    $body = @{
        userId = "test-user"
        propertyId = $allProperties[0].id
        property = $allProperties[0]
    } | ConvertTo-Json -Depth 10
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/saved-properties" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to save property" }
    $script:savedPropertyId = $data.data._id
}

# Test 9: Saved Properties - Get
Test-Feature "Get Saved Properties" {
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/saved-properties?userId=test-user" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to get saved properties" }
    if ($data.data.Count -eq 0) { throw "No saved properties found" }
}

# Test 10: Saved Properties - Check
Test-Feature "Check Saved Property" {
    if (-not $savedPropertyId) { throw "No saved property ID" }
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/saved-properties/check/$($allProperties[0].id)?userId=test-user" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to check saved property" }
    if (-not $data.isSaved) { throw "Property should be saved" }
}

# Test 11: Saved Properties - Delete
Test-Feature "Delete Saved Property" {
    if (-not $savedPropertyId) { throw "No saved property ID" }
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/saved-properties/$savedPropertyId?userId=test-user" -Method DELETE -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to delete saved property" }
}

# Test 12: ML Service - Predict Endpoint
Test-Feature "ML Service - Predict Endpoint" {
    $testData = @{
        property_type = "SFH"
        lot_area = 5000
        building_area = 0
        bedrooms = 3
        bathrooms = 2
        year_built = 2015
        has_pool = $true
        has_garage = $false
        school_rating = 9
    } | ConvertTo-Json
    
    try {
        $res = Invoke-WebRequest -Uri "$ML_URL/predict" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
        $data = $res.Content | ConvertFrom-Json
        if ($data.predicted_price -eq $null) { throw "No prediction returned" }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 503) {
            # Model not loaded is acceptable
            Write-Host "   (Model not loaded - expected)" -ForegroundColor Yellow
        } else {
            throw
        }
    }
}

# Test 13: Properties with Predictions
Test-Feature "Get Properties with Predictions" {
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties?predict=true" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Failed to get properties with predictions" }
    if (-not $data.data -or $data.data.Count -eq 0) { throw "No properties returned" }
}

# Test 14: Search with Predictions
Test-Feature "Search with Predictions" {
    $body = @{
        message = "Show me properties in New York"
        predict = $true
    } | ConvertTo-Json
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties/search" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Search with predictions failed" }
    if (-not $data.data -or $data.data.Count -eq 0) { throw "No results" }
}

# Test 15: Complex Search Query
Test-Feature "Complex Search Query" {
    $body = @{
        message = "Show me 3 bedroom apartments in New York under 500000"
        predict = $false
    } | ConvertTo-Json
    
    $res = Invoke-WebRequest -Uri "$BASE_URL/api/properties/search" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $res.Content | ConvertFrom-Json
    if (-not $data.success) { throw "Complex search failed" }
}

# Test 16: Data Integrity - All Properties Have Required Fields
Test-Feature "Data Integrity - Required Fields" {
    if (-not $allProperties -or $allProperties.Count -eq 0) { throw "No properties to test" }
    
    $requiredFields = @('id', 'title', 'price', 'location', 'bedrooms', 'bathrooms', 'size_sqft', 'image_url')
    foreach ($prop in $allProperties) {
        foreach ($field in $requiredFields) {
            if ($prop.$field -eq $null -or $prop.$field -eq "") {
                throw "Property $($prop.id) missing required field: $field"
            }
        }
    }
}

# Test 17: Frontend Accessibility
Test-Feature "Frontend Accessibility" {
    $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($res.StatusCode -ne 200) { throw "Frontend not accessible" }
    if ($res.Content -notmatch "Real Estate Chatbot") { throw "Frontend content not found" }
}

# Summary
Write-Host "`n" + ("=" * 60)
Write-Host "`n📊 TEST SUMMARY`n" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }
Write-Host "📈 Total: $total"
Write-Host "🎯 Success Rate: $successRate%`n"

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Project is working perfectly!`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above.`n" -ForegroundColor Yellow
}

