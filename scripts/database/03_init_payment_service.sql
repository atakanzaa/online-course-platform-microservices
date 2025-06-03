-- filepath: scripts/database/03_init_payment_service.sql
-- Database initialization script for Payment Service

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSON,
    supported_currencies JSON,
    fees_configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_provider (provider),
    INDEX idx_active (is_active)
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    payment_method_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    gateway_transaction_id VARCHAR(200),
    gateway_response JSON,
    failure_reason TEXT,
    invoice_number VARCHAR(50),
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP NULL,
    refund_date TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_created_at (created_at),
    INDEX idx_gateway_transaction_id (gateway_transaction_id)
);

-- Create payment attempts table (for tracking retry attempts)
CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    status ENUM('PROCESSING', 'SUCCESS', 'FAILED') NOT NULL,
    gateway_response JSON,
    error_code VARCHAR(50),
    error_message TEXT,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    refund_id VARCHAR(100) UNIQUE NOT NULL,
    original_transaction_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reason ENUM('CUSTOMER_REQUEST', 'CHARGEBACK', 'COURSE_CANCELLED', 'TECHNICAL_ISSUE', 'OTHER') NOT NULL,
    reason_details TEXT,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    gateway_refund_id VARCHAR(200),
    gateway_response JSON,
    processed_by BIGINT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (original_transaction_id) REFERENCES payment_transactions(id),
    INDEX idx_refund_id (refund_id),
    INDEX idx_original_transaction_id (original_transaction_id),
    INDEX idx_status (status),
    INDEX idx_reason (reason),
    INDEX idx_created_at (created_at)
);

-- Create payment webhooks table (for tracking gateway webhooks)
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    webhook_id VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    signature VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_attempts INT DEFAULT 0,
    related_transaction_id BIGINT,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    
    FOREIGN KEY (related_transaction_id) REFERENCES payment_transactions(id),
    INDEX idx_webhook_id (webhook_id),
    INDEX idx_provider (provider),
    INDEX idx_event_type (event_type),
    INDEX idx_is_processed (is_processed),
    INDEX idx_received_at (received_at)
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_interval ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    trial_days INT DEFAULT 0,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_plan_id (plan_id),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    status ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'TRIAL',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    trial_end_date TIMESTAMP NULL,
    next_billing_date TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_next_billing_date (next_billing_date),
    INDEX idx_end_date (end_date)
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    applicable_courses JSON,
    applicable_categories JSON,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_valid_from (valid_from),
    INDEX idx_valid_until (valid_until),
    INDEX idx_active (is_active),
    INDEX idx_usage_count (usage_count)
);

-- Create coupon usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id),
    UNIQUE KEY uk_coupon_transaction (coupon_id, transaction_id),
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_used_at (used_at)
);

-- Insert default payment methods
INSERT INTO payment_methods (name, display_name, provider, configuration, supported_currencies, fees_configuration) VALUES
('credit_card', 'Credit Card', 'stripe', 
 JSON_OBJECT('api_key', 'sk_test_...', 'webhook_secret', 'whsec_...'),
 JSON_ARRAY('USD', 'EUR', 'GBP', 'TRY'),
 JSON_OBJECT('percentage', 2.9, 'fixed', 0.30)),
('paypal', 'PayPal', 'paypal',
 JSON_OBJECT('client_id', 'paypal_client_id', 'client_secret', 'paypal_secret'),
 JSON_ARRAY('USD', 'EUR', 'GBP'),
 JSON_OBJECT('percentage', 3.5, 'fixed', 0.35)),
('bank_transfer', 'Bank Transfer', 'manual',
 JSON_OBJECT('account_number', 'TR1234567890', 'iban', 'TR123456789012345678901234'),
 JSON_ARRAY('TRY', 'USD', 'EUR'),
 JSON_OBJECT('percentage', 0, 'fixed', 0))
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample subscription plans
INSERT INTO subscription_plans (plan_id, name, description, price, billing_interval, trial_days, features) VALUES
('basic_monthly', 'Basic Monthly', 'Access to basic courses and features', 29.99, 'MONTHLY', 7,
 JSON_ARRAY('Access to 100+ courses', 'Mobile app access', 'Basic support')),
('premium_monthly', 'Premium Monthly', 'Access to all courses and premium features', 49.99, 'MONTHLY', 14,
 JSON_ARRAY('Access to all courses', 'Downloadable content', 'Priority support', 'Certificates')),
('premium_yearly', 'Premium Yearly', 'Best value - Full access with yearly billing', 399.99, 'YEARLY', 30,
 JSON_ARRAY('Access to all courses', 'Downloadable content', 'Priority support', 'Certificates', '2 months free'))
ON DUPLICATE KEY UPDATE plan_id = plan_id;

-- Insert sample coupons
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME20', 'Welcome Discount', '20% off for new users', 'PERCENTAGE', 20.00, 50.00, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('STUDENT50', 'Student Discount', '$50 off for students', 'FIXED_AMOUNT', 50.00, 100.00, 500, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('BLACKFRIDAY', 'Black Friday Special', '40% off everything', 'PERCENTAGE', 40.00, NULL, 10000, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE code = code;
