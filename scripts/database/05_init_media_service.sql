-- filepath: scripts/database/05_init_media_service.sql
-- Database initialization script for Media Service

-- Create media storage providers table
CREATE TABLE IF NOT EXISTS media_storage_providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('AWS_S3', 'AZURE_BLOB', 'GOOGLE_CLOUD', 'LOCAL', 'CDN') NOT NULL,
    config JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_active (is_active),
    INDEX idx_priority (priority)
);

-- Create media files table
CREATE TABLE IF NOT EXISTS media_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type ENUM('VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'OTHER') NOT NULL,
    category ENUM('COURSE_CONTENT', 'PROFILE_AVATAR', 'COURSE_THUMBNAIL', 'LESSON_MATERIAL', 'ASSIGNMENT', 'CERTIFICATE') NOT NULL,
    storage_provider_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    course_id BIGINT NULL,
    lesson_id BIGINT NULL,
    checksum VARCHAR(64) NOT NULL,
    upload_status ENUM('UPLOADING', 'COMPLETED', 'FAILED', 'PROCESSING') DEFAULT 'UPLOADING',
    processing_status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'NOT_REQUIRED') DEFAULT 'NOT_REQUIRED',
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_key VARCHAR(255) NULL,
    access_permissions JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (storage_provider_id) REFERENCES media_storage_providers(id),
    INDEX idx_uuid (uuid),
    INDEX idx_filename (filename),
    INDEX idx_file_type (file_type),
    INDEX idx_category (category),
    INDEX idx_storage_provider_id (storage_provider_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_course_id (course_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_upload_status (upload_status),
    INDEX idx_processing_status (processing_status),
    INDEX idx_is_public (is_public),
    INDEX idx_created_at (created_at)
);

-- Create video processing table
CREATE TABLE IF NOT EXISTS video_processing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_file_id BIGINT NOT NULL,
    processing_job_id VARCHAR(100),
    original_duration INT, -- in seconds
    original_resolution VARCHAR(20),
    original_bitrate INT,
    original_codec VARCHAR(50),
    target_qualities JSON, -- ["720p", "1080p", "480p"]
    processing_status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT,
    processing_logs JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_processing_job_id (processing_job_id),
    INDEX idx_processing_status (processing_status),
    INDEX idx_started_at (started_at)
);

-- Create video quality variants table
CREATE TABLE IF NOT EXISTS video_quality_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_processing_id BIGINT NOT NULL,
    quality VARCHAR(20) NOT NULL, -- 480p, 720p, 1080p, etc.
    resolution VARCHAR(20) NOT NULL, -- 1920x1080, 1280x720, etc.
    bitrate INT NOT NULL,
    codec VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    duration INT NOT NULL, -- in seconds
    file_path VARCHAR(500) NOT NULL,
    url VARCHAR(1000),
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (video_processing_id) REFERENCES video_processing(id) ON DELETE CASCADE,
    UNIQUE KEY uk_processing_quality (video_processing_id, quality),
    INDEX idx_video_processing_id (video_processing_id),
    INDEX idx_quality (quality),
    INDEX idx_status (status)
);

-- Create media thumbnails table
CREATE TABLE IF NOT EXISTS media_thumbnails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_file_id BIGINT NOT NULL,
    thumbnail_type ENUM('AUTO_GENERATED', 'CUSTOM_UPLOAD', 'VIDEO_FRAME') NOT NULL,
    size ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    url VARCHAR(1000),
    timestamp_seconds INT NULL, -- for video thumbnails
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_thumbnail_type (thumbnail_type),
    INDEX idx_size (size),
    INDEX idx_is_default (is_default)
);

-- Create media access logs table
CREATE TABLE IF NOT EXISTS media_access_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_file_id BIGINT NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(100),
    ip_address INET6,
    user_agent TEXT,
    referer VARCHAR(1000),
    access_type ENUM('VIEW', 'DOWNLOAD', 'STREAM', 'PREVIEW') NOT NULL,
    quality VARCHAR(20), -- for video streams
    bytes_served BIGINT DEFAULT 0,
    duration_watched INT DEFAULT 0, -- in seconds for videos
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_access_type (access_type),
    INDEX idx_created_at (created_at)
);

-- Create media streaming sessions table
CREATE TABLE IF NOT EXISTS media_streaming_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    media_file_id BIGINT NOT NULL,
    user_id BIGINT,
    quality VARCHAR(20) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    total_duration INT DEFAULT 0, -- in seconds
    bytes_streamed BIGINT DEFAULT 0,
    buffer_events INT DEFAULT 0,
    seek_events INT DEFAULT 0,
    quality_changes INT DEFAULT 0,
    client_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_start_time (start_time)
);

-- Create media analytics table
CREATE TABLE IF NOT EXISTS media_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    media_file_id BIGINT NOT NULL,
    file_type ENUM('VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'OTHER') NOT NULL,
    total_views INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    total_streaming_time INT DEFAULT 0, -- in seconds
    total_bytes_served BIGINT DEFAULT 0,
    unique_viewers INT DEFAULT 0,
    average_watch_time DECIMAL(8,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    peak_concurrent_streams INT DEFAULT 0,
    bandwidth_usage BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    UNIQUE KEY uk_date_media_file (date, media_file_id),
    INDEX idx_date (date),
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_file_type (file_type)
);

-- Create CDN cache status table
CREATE TABLE IF NOT EXISTS cdn_cache_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_file_id BIGINT NOT NULL,
    cdn_provider VARCHAR(50) NOT NULL,
    cache_key VARCHAR(255) NOT NULL,
    cache_status ENUM('MISS', 'HIT', 'EXPIRED', 'PURGED') NOT NULL,
    edge_location VARCHAR(100),
    ttl INT, -- time to live in seconds
    cache_size BIGINT,
    last_accessed TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
    UNIQUE KEY uk_media_cdn_key (media_file_id, cdn_provider, cache_key),
    INDEX idx_media_file_id (media_file_id),
    INDEX idx_cdn_provider (cdn_provider),
    INDEX idx_cache_status (cache_status),
    INDEX idx_expires_at (expires_at)
);

-- Insert default storage providers
INSERT INTO media_storage_providers (name, type, config, is_active, priority) VALUES
('aws-s3-primary', 'AWS_S3', '{"bucket": "course-platform-media", "region": "us-east-1", "access_key": "encrypted", "secret_key": "encrypted"}', TRUE, 1),
('aws-s3-backup', 'AWS_S3', '{"bucket": "course-platform-backup", "region": "us-west-2", "access_key": "encrypted", "secret_key": "encrypted"}', TRUE, 2),
('cloudflare-cdn', 'CDN', '{"zone_id": "encrypted", "api_token": "encrypted", "domain": "cdn.courseplatform.com"}', TRUE, 3),
('local-storage', 'LOCAL', '{"path": "/var/media", "max_size": "100GB"}', FALSE, 4)
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample media files (this would typically be done by the application)
INSERT INTO media_files (uuid, original_filename, filename, file_path, file_size, mime_type, file_type, category, storage_provider_id, uploaded_by, course_id, checksum, upload_status, processing_status, is_public, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'intro-to-python.mp4', 'intro-to-python-v1.mp4', '/courses/1/videos/intro-to-python-v1.mp4', 157286400, 'video/mp4', 'VIDEO', 'COURSE_CONTENT', 1, 2, 1, 'abc123def456', 'COMPLETED', 'COMPLETED', FALSE, '{"duration": 1800, "resolution": "1920x1080", "codec": "h264"}'),
('550e8400-e29b-41d4-a716-446655440001', 'python-basics.pdf', 'python-basics-guide.pdf', '/courses/1/documents/python-basics-guide.pdf', 2048576, 'application/pdf', 'DOCUMENT', 'LESSON_MATERIAL', 1, 2, 1, 'def456ghi789', 'COMPLETED', 'NOT_REQUIRED', FALSE, '{"pages": 45, "language": "en"}'),
('550e8400-e29b-41d4-a716-446655440002', 'course-thumbnail.jpg', 'python-course-thumb.jpg', '/courses/1/thumbnails/python-course-thumb.jpg', 524288, 'image/jpeg', 'IMAGE', 'COURSE_THUMBNAIL', 1, 2, 1, 'ghi789jkl012', 'COMPLETED', 'NOT_REQUIRED', TRUE, '{"width": 1280, "height": 720, "format": "JPEG"}')
ON DUPLICATE KEY UPDATE uuid = uuid;
