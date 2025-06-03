-- filepath: scripts/database/04_init_notification_service.sql
-- Database initialization script for Notification Service

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    subject VARCHAR(255),
    content LONGTEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    template_id BIGINT,
    type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    channel ENUM('SYSTEM', 'MARKETING', 'TRANSACTIONAL', 'COURSE_UPDATE') NOT NULL DEFAULT 'SYSTEM',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    subject VARCHAR(255),
    content LONGTEXT NOT NULL,
    metadata JSON,
    status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (template_id) REFERENCES notification_templates(id),
    INDEX idx_user_id (user_id),
    INDEX idx_template_id (template_id),
    INDEX idx_type (type),
    INDEX idx_channel (channel),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_created_at (created_at)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    channel ENUM('SYSTEM', 'MARKETING', 'TRANSACTIONAL', 'COURSE_UPDATE') NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    frequency ENUM('IMMEDIATE', 'DAILY_DIGEST', 'WEEKLY_DIGEST', 'DISABLED') DEFAULT 'IMMEDIATE',
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_channel (user_id, channel),
    INDEX idx_user_id (user_id),
    INDEX idx_channel (channel)
);

-- Create email delivery log table
CREATE TABLE IF NOT EXISTS email_delivery_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    provider ENUM('SENDGRID', 'MAILGUN', 'SES', 'SMTP') NOT NULL,
    provider_message_id VARCHAR(255),
    status ENUM('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'BLOCKED') NOT NULL,
    bounce_reason TEXT,
    complaint_reason TEXT,
    delivered_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_provider (provider),
    INDEX idx_status (status),
    INDEX idx_delivered_at (delivered_at)
);

-- Create sms delivery log table
CREATE TABLE IF NOT EXISTS sms_delivery_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    provider ENUM('TWILIO', 'NEXMO', 'AWS_SNS') NOT NULL,
    provider_message_id VARCHAR(255),
    status ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'UNDELIVERED') NOT NULL,
    error_code VARCHAR(10),
    error_message TEXT,
    cost DECIMAL(8,6),
    currency VARCHAR(3) DEFAULT 'USD',
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_recipient_phone (recipient_phone),
    INDEX idx_provider (provider),
    INDEX idx_status (status),
    INDEX idx_delivered_at (delivered_at)
);

-- Create push notification log table
CREATE TABLE IF NOT EXISTS push_notification_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    device_token VARCHAR(255) NOT NULL,
    platform ENUM('IOS', 'ANDROID', 'WEB') NOT NULL,
    provider ENUM('FCM', 'APNS', 'WEB_PUSH') NOT NULL,
    provider_message_id VARCHAR(255),
    status ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'INVALID_TOKEN') NOT NULL,
    error_message TEXT,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_device_token (device_token),
    INDEX idx_platform (platform),
    INDEX idx_provider (provider),
    INDEX idx_status (status)
);

-- Create notification analytics table
CREATE TABLE IF NOT EXISTS notification_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    type ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL,
    channel ENUM('SYSTEM', 'MARKETING', 'TRANSACTIONAL', 'COURSE_UPDATE') NOT NULL,
    total_sent INT DEFAULT 0,
    total_delivered INT DEFAULT 0,
    total_opened INT DEFAULT 0,
    total_clicked INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    total_bounced INT DEFAULT 0,
    total_unsubscribed INT DEFAULT 0,
    delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    open_rate DECIMAL(5,2) DEFAULT 0.00,
    click_rate DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_date_type_channel (date, type, channel),
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_channel (channel)
);

-- Insert default notification templates
INSERT INTO notification_templates (name, type, subject, content, variables) VALUES
('welcome_email', 'EMAIL', 'Welcome to Our Learning Platform!', 
'<h1>Welcome {{user_name}}!</h1><p>Thank you for joining our platform. Start your learning journey today!</p>', 
'["user_name", "platform_name"]'),

('course_enrollment_confirmation', 'EMAIL', 'Course Enrollment Confirmed', 
'<h2>Enrollment Confirmed</h2><p>You have successfully enrolled in {{course_title}}. Start learning now!</p>', 
'["user_name", "course_title", "instructor_name"]'),

('payment_success', 'EMAIL', 'Payment Confirmation', 
'<h2>Payment Successful</h2><p>Your payment of {{amount}} {{currency}} has been processed successfully.</p>', 
'["user_name", "amount", "currency", "course_title"]'),

('course_completion', 'EMAIL', 'Congratulations on Course Completion!', 
'<h2>Course Completed!</h2><p>Congratulations {{user_name}}! You have completed {{course_title}}.</p>', 
'["user_name", "course_title", "certificate_url"]'),

('new_lesson_available', 'PUSH', 'New Lesson Available', 
'A new lesson is available in {{course_title}}. Continue your learning!', 
'["course_title", "lesson_title"]'),

('course_reminder', 'PUSH', 'Continue Learning', 
'You haven\'t visited {{course_title}} in a while. Continue where you left off!', 
'["course_title", "progress_percentage"]')

ON DUPLICATE KEY UPDATE name = name;

-- Insert default notification preferences for sample users
INSERT INTO notification_preferences (user_id, channel, email_enabled, push_enabled) VALUES
(1, 'SYSTEM', TRUE, TRUE),
(1, 'MARKETING', FALSE, FALSE),
(1, 'TRANSACTIONAL', TRUE, TRUE),
(1, 'COURSE_UPDATE', TRUE, TRUE),
(2, 'SYSTEM', TRUE, TRUE),
(2, 'MARKETING', TRUE, FALSE),
(2, 'TRANSACTIONAL', TRUE, TRUE),
(2, 'COURSE_UPDATE', TRUE, TRUE)
ON DUPLICATE KEY UPDATE user_id = user_id;
