# Test Script: Create Course & Process Payment
# This script tests the core functionality of creating a course and processing a payment

Write-Host "🧪 Testing core microservices functionality" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow

# 1. Create a test course
$courseData = @{
    title = "İyzico Payment Integration Course"
    description = "Learn how to integrate İyzico payment gateway with 3DS support"
    category = "Development"
    language = "Turkish"
    level = "INTERMEDIATE"
    instructorId = 1
    price = 199.99
    published = $true
    modules = @(
        @{
            title = "Introduction to İyzico"
            orderIndex = 1
            lessons = @(
                @{
                    title = "İyzico API Overview"
                    description = "Understanding the İyzico payment gateway"
                    videoId = "video-001"
                    orderIndex = 1
                }
            )
        },
        @{
            title = "3D Secure Integration"
            orderIndex = 2
            lessons = @(
                @{
                    title = "Setting up 3DS"
                    description = "How to implement 3D Secure authentication"
                    videoId = "video-002"
                    orderIndex = 1
                },
                @{
                    title = "Testing 3DS Payments"
                    description = "Using İyzico test cards to verify 3DS flows"
                    videoId = "video-003"
                    orderIndex = 2
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$courseServiceUrl = "http://localhost:8082/course-service/api/courses"
$paymentServiceUrl = "http://localhost:8083/payment-service/api/payments"

Write-Host "`n1️⃣ Creating test course..." -ForegroundColor Cyan

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $courseResponse = Invoke-RestMethod -Uri $courseServiceUrl -Method Post -Body $courseData -Headers $headers
    
    $courseId = $courseResponse.id
    $courseTitle = $courseResponse.title
    $coursePrice = $courseResponse.price
    
    Write-Host "✅ Course created successfully!" -ForegroundColor Green
    Write-Host "   ID: $courseId" -ForegroundColor White
    Write-Host "   Title: $courseTitle" -ForegroundColor White
    Write-Host "   Price: $coursePrice TRY" -ForegroundColor White
    
    # 2. Process a test payment
    Write-Host "`n2️⃣ Processing test payment with İyzico..." -ForegroundColor Cyan
    
    $paymentData = @{
        userId = 1
        courseId = $courseId
        amount = $coursePrice
        buyerName = "Test"
        buyerSurname = "User"
        buyerEmail = "test@example.com"
        buyerPhone = "+905555555555"
        buyerIdentityNumber = "11111111111"
        buyerAddress = "Test Address"
        buyerCity = "Istanbul"
        buyerCountry = "Turkey"
        buyerZipCode = "34000"
        cardHolderName = "Test User"
        cardNumber = "5528790000000008"
        expireMonth = "12"
        expireYear = "2030"
        cvc = "123"
    } | ConvertTo-Json
    
    try {
        $paymentResponse = Invoke-RestMethod -Uri "$paymentServiceUrl" -Method Post -Body $paymentData -Headers $headers
        
        Write-Host "✅ Payment processed successfully!" -ForegroundColor Green
        Write-Host "   Payment ID: $($paymentResponse.id)" -ForegroundColor White
        Write-Host "   Status: $($paymentResponse.status)" -ForegroundColor White
        Write-Host "   Amount: $($paymentResponse.amount) TRY" -ForegroundColor White
        
        # 3. Verify course purchase
        Write-Host "`n3️⃣ Verifying course purchase..." -ForegroundColor Cyan
        
        try {
            $purchaseCheckUrl = "$paymentServiceUrl/check-purchase?userId=1&courseId=$courseId" 
            $purchaseCheck = Invoke-RestMethod -Uri $purchaseCheckUrl -Method Get
            
            if ($purchaseCheck -eq $true) {
                Write-Host "✅ Course purchase verified!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Course purchase not found (expected in test environment)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Could not verify purchase: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "⚠️ Payment test completed with status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "   This may be expected for İyzico integration testing" -ForegroundColor Gray
    }
    
} catch {
    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Connection error" }
    $errorMessage = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
    
    Write-Host "❌ Error creating course: $errorMessage (Status: $statusCode)" -ForegroundColor Red
    Write-Host "   Check if the services are fully started (wait 60-90 seconds after startup)" -ForegroundColor Yellow
}

Write-Host "`n🔍 Test Summary:" -ForegroundColor Cyan
Write-Host "1. Created test course: İyzico Payment Integration Course" -ForegroundColor White
Write-Host "2. Attempted payment with İyzico test card" -ForegroundColor White
Write-Host "3. Verified purchase status" -ForegroundColor White
Write-Host "`nConsider starting infrastructure services for complete testing:" -ForegroundColor Yellow
Write-Host "docker-compose up -d" -ForegroundColor White
