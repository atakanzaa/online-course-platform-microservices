# Simple YAML validation script
param($FilePath)

if (-not $FilePath) {
    $FilePath = "docker-compose.prod.yml"
}

Write-Host "Validating YAML file: $FilePath" -ForegroundColor Green

# Check for common YAML issues
$content = Get-Content $FilePath
$lineNumber = 0

foreach ($line in $content) {
    $lineNumber++
    
    # Check for tabs (should use spaces)
    if ($line -match "`t") {
        Write-Host "Line $lineNumber: Contains tab character (use spaces instead)" -ForegroundColor Red
        Write-Host "  $line" -ForegroundColor Yellow
    }
    
    # Check for trailing spaces
    if ($line -match "  $") {
        Write-Host "Line $lineNumber: Contains trailing spaces" -ForegroundColor Yellow
    }
    
    # Check for missing spaces after colons
    if ($line -match ":[^ ]" -and -not ($line -match "://")) {
        Write-Host "Line $lineNumber: Missing space after colon" -ForegroundColor Red
        Write-Host "  $line" -ForegroundColor Yellow
    }
}

Write-Host "YAML validation complete" -ForegroundColor Green
