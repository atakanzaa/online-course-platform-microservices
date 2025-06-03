-- filepath: scripts/database/06_init_analytics_service.sql
-- Database initialization script for Analytics Service

-- Create user analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_login_time INT DEFAULT 0, -- in minutes
    total_study_time INT DEFAULT 0, -- in minutes
    courses_accessed INT DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    videos_watched INT DEFAULT 0,
    video_watch_time INT DEFAULT 0, -- in minutes
    assignments_submitted INT DEFAULT 0,
    quiz_attempts INT DEFAULT 0,
    quiz_score_avg DECIMAL(5,2) DEFAULT 0.00,
    forum_posts INT DEFAULT 0,
    forum_replies INT DEFAULT 0,
    downloads INT DEFAULT 0,
    page_views INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    last_activity_at TIMESTAMP,
    device_type ENUM('DESKTOP', 'MOBILE', 'TABLET') NOT NULL,
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(2),
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_date_device (user_id, date, device_type),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_device_type (device_type),
    INDEX idx_country (country)
);

-- Create course analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_enrollments INT DEFAULT 0,
    new_enrollments INT DEFAULT 0,
    active_students INT DEFAULT 0,
    completed_students INT DEFAULT 0,
    dropped_students INT DEFAULT 0,
    total_study_time INT DEFAULT 0, -- in minutes
    average_completion_time INT DEFAULT 0, -- in days
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    retention_rate_7d DECIMAL(5,2) DEFAULT 0.00,
    retention_rate_30d DECIMAL(5,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    page_views INT DEFAULT 0,
    video_views INT DEFAULT 0,
    total_video_watch_time INT DEFAULT 0, -- in minutes
    assignment_submissions INT DEFAULT 0,
    quiz_attempts INT DEFAULT 0,
    average_quiz_score DECIMAL(5,2) DEFAULT 0.00,
    forum_activity INT DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    refunds DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_course_date (course_id, date),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date),
    INDEX idx_enrollments (total_enrollments),
    INDEX idx_completion_rate (completion_rate)
);

-- Create lesson analytics table
CREATE TABLE IF NOT EXISTS lesson_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_views INT DEFAULT 0,
    unique_viewers INT DEFAULT 0,
    completion_count INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_watch_time INT DEFAULT 0, -- in seconds
    total_watch_time INT DEFAULT 0, -- in seconds
    replay_count INT DEFAULT 0,
    skip_count INT DEFAULT 0,
    seek_events INT DEFAULT 0,
    quality_changes INT DEFAULT 0,
    buffer_events INT DEFAULT 0,
    download_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    bookmark_count INT DEFAULT 0,
    note_count INT DEFAULT 0,
    question_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_lesson_date (lesson_id, date),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date),
    INDEX idx_completion_rate (completion_rate)
);

-- Create learning path analytics table
CREATE TABLE IF NOT EXISTS learning_path_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    date DATE NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    lessons_completed INT DEFAULT 0,
    total_lessons INT NOT NULL,
    time_spent INT DEFAULT 0, -- in minutes
    last_lesson_id BIGINT,
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    difficulty_rating ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    predicted_completion_date DATE,
    at_risk_of_dropping BOOLEAN DEFAULT FALSE,
    intervention_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_course_date (user_id, course_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date),
    INDEX idx_progress_percentage (progress_percentage),
    INDEX idx_at_risk_of_dropping (at_risk_of_dropping)
);

-- Create revenue analytics table
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    course_id BIGINT,
    instructor_id BIGINT,
    payment_method ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTOCURRENCY', 'OTHER'),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    gross_revenue DECIMAL(12,2) DEFAULT 0.00,
    net_revenue DECIMAL(12,2) DEFAULT 0.00,
    platform_fee DECIMAL(12,2) DEFAULT 0.00,
    instructor_payout DECIMAL(12,2) DEFAULT 0.00,
    payment_processing_fee DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    refunds DECIMAL(12,2) DEFAULT 0.00,
    chargebacks DECIMAL(12,2) DEFAULT 0.00,
    transaction_count INT DEFAULT 0,
    new_customer_revenue DECIMAL(12,2) DEFAULT 0.00,
    returning_customer_revenue DECIMAL(12,2) DEFAULT 0.00,
    subscription_revenue DECIMAL(12,2) DEFAULT 0.00,
    one_time_revenue DECIMAL(12,2) DEFAULT 0.00,
    coupon_discounts DECIMAL(12,2) DEFAULT 0.00,
    country VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_course_id (course_id),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_currency (currency),
    INDEX idx_country (country)
);

-- Create platform analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    returning_users INT DEFAULT 0,
    total_courses INT DEFAULT 0,
    new_courses INT DEFAULT 0,
    total_lessons INT DEFAULT 0,
    total_instructors INT DEFAULT 0,
    new_instructors INT DEFAULT 0,
    total_enrollments INT DEFAULT 0,
    new_enrollments INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    average_session_duration INT DEFAULT 0, -- in minutes
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    churn_rate DECIMAL(5,2) DEFAULT 0.00,
    customer_lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    monthly_recurring_revenue DECIMAL(12,2) DEFAULT 0.00,
    server_uptime DECIMAL(5,2) DEFAULT 99.99,
    average_response_time DECIMAL(8,2) DEFAULT 0.00, -- in milliseconds
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    storage_used BIGINT DEFAULT 0, -- in bytes
    bandwidth_used BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_date (date),
    INDEX idx_date (date)
);

-- Create user behavior events table
CREATE TABLE IF NOT EXISTS user_behavior_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    session_id VARCHAR(100) NOT NULL,
    event_type ENUM('PAGE_VIEW', 'CLICK', 'SCROLL', 'SEARCH', 'FILTER', 'PURCHASE', 'ENROLLMENT', 'COMPLETION', 'LOGOUT') NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_action VARCHAR(100) NOT NULL,
    event_label VARCHAR(200),
    event_value DECIMAL(10,2),
    page_url VARCHAR(1000),
    page_title VARCHAR(200),
    referrer VARCHAR(1000),
    user_agent TEXT,
    ip_address INET6,
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    device_type ENUM('DESKTOP', 'MOBILE', 'TABLET') NOT NULL,
    browser VARCHAR(50),
    os VARCHAR(50),
    screen_resolution VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_id BIGINT,
    lesson_id BIGINT,
    custom_properties JSON,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_event_category (event_category),
    INDEX idx_timestamp (timestamp),
    INDEX idx_course_id (course_id),
    INDEX idx_device_type (device_type),
    INDEX idx_country (country)
);

-- Create A/B test experiments table
CREATE TABLE IF NOT EXISTS ab_test_experiments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    hypothesis TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    traffic_allocation DECIMAL(5,2) DEFAULT 50.00,
    control_variant VARCHAR(50) DEFAULT 'control',
    test_variants JSON NOT NULL,
    success_metrics JSON NOT NULL,
    target_audience JSON,
    sample_size_required INT,
    confidence_level DECIMAL(5,2) DEFAULT 95.00,
    statistical_significance DECIMAL(5,2),
    winner_variant VARCHAR(50),
    results JSON,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_created_by (created_by)
);

-- Create A/B test assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    experiment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    variant VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_exposure_at TIMESTAMP,
    conversion_events JSON,
    
    FOREIGN KEY (experiment_id) REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
    UNIQUE KEY uk_experiment_user (experiment_id, user_id),
    INDEX idx_experiment_id (experiment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_variant (variant),
    INDEX idx_assigned_at (assigned_at)
);

-- Create cohort analysis table
CREATE TABLE IF NOT EXISTS cohort_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_month DATE NOT NULL,
    month_number INT NOT NULL, -- 0 for cohort month, 1 for first month after, etc.
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    retention_rate DECIMAL(5,2) DEFAULT 0.00,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    avg_revenue_per_user DECIMAL(10,2) DEFAULT 0.00,
    churn_count INT DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_cohort_month_number (cohort_month, month_number),
    INDEX idx_cohort_month (cohort_month),
    INDEX idx_month_number (month_number),
    INDEX idx_retention_rate (retention_rate)
);

-- Insert sample analytics data
INSERT INTO platform_analytics (date, total_users, new_users, active_users, total_courses, new_courses, total_enrollments, new_enrollments) VALUES
('2024-01-01', 1000, 50, 300, 25, 2, 500, 30),
('2024-01-02', 1050, 60, 320, 25, 0, 530, 35),
('2024-01-03', 1110, 45, 310, 27, 2, 565, 40)
ON DUPLICATE KEY UPDATE date = date;

INSERT INTO user_analytics (user_id, date, total_login_time, total_study_time, courses_accessed, lessons_completed, device_type, browser, os, country) VALUES
(1, '2024-01-01', 120, 90, 2, 3, 'DESKTOP', 'Chrome', 'Windows', 'US'),
(1, '2024-01-02', 150, 120, 3, 4, 'DESKTOP', 'Chrome', 'Windows', 'US'),
(2, '2024-01-01', 80, 60, 1, 2, 'MOBILE', 'Safari', 'iOS', 'CA'),
(2, '2024-01-02', 100, 75, 2, 3, 'MOBILE', 'Safari', 'iOS', 'CA')
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO course_analytics (course_id, date, total_enrollments, new_enrollments, active_students, completion_rate, average_rating) VALUES
(1, '2024-01-01', 150, 10, 45, 78.50, 4.5),
(1, '2024-01-02', 160, 12, 48, 79.20, 4.6),
(2, '2024-01-01', 100, 8, 30, 65.30, 4.2),
(2, '2024-01-02', 108, 9, 32, 66.10, 4.3)
ON DUPLICATE KEY UPDATE course_id = course_id;
