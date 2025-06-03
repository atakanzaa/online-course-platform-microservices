-- filepath: scripts/database/02_init_course_service.sql
-- Database initialization script for Course Service

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    INDEX idx_sort_order (sort_order)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    detailed_description LONGTEXT,
    instructor_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    duration_minutes INT DEFAULT 0,
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    requirements JSON,
    what_you_will_learn JSON,
    target_audience JSON,
    enrollment_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_featured (is_featured),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at)
);

-- Create course sections table
CREATE TABLE IF NOT EXISTS course_sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_published (is_published)
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content LONGTEXT,
    video_url VARCHAR(500),
    video_duration_seconds INT DEFAULT 0,
    lesson_type ENUM('VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT') NOT NULL DEFAULT 'VIDEO',
    sort_order INT NOT NULL DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    resources JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
    INDEX idx_section_id (section_id),
    INDEX idx_lesson_type (lesson_type),
    INDEX idx_sort_order (sort_order),
    INDEX idx_published (is_published),
    INDEX idx_preview (is_preview)
);

-- Create course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'COMPLETED', 'DROPPED') DEFAULT 'ACTIVE',
    certificate_url VARCHAR(500),
    payment_id BIGINT,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_course (student_id, course_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_enrollment_date (enrollment_date),
    INDEX idx_status (status),
    INDEX idx_progress (progress_percentage)
);

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP NULL,
    watch_time_seconds INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uk_enrollment_lesson (enrollment_id, lesson_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_completed (is_completed)
);

-- Create course reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_course_student (course_id, student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_student_id (student_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
('Programming', 'Software development and programming courses', 1),
('Data Science', 'Data analysis, machine learning, and AI courses', 2),
('Web Development', 'Frontend and backend web development', 3),
('Mobile Development', 'iOS and Android app development', 4),
('DevOps', 'Cloud computing, containers, and CI/CD', 5),
('Cybersecurity', 'Information security and ethical hacking', 6),
('Business', 'Entrepreneurship, marketing, and management', 7),
('Design', 'UI/UX design, graphic design, and multimedia', 8)
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample course
INSERT INTO courses (title, description, instructor_id, category_id, price, level, status, duration_minutes, published_at)
VALUES 
('Introduction to Spring Boot', 'Learn the fundamentals of Spring Boot framework for Java web development', 2, 1, 99.99, 'BEGINNER', 'PUBLISHED', 480, NOW())
ON DUPLICATE KEY UPDATE title = title;
