package media_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import media_service.dto.MediaFileDto;
import media_service.dto.MediaUploadRequest;
import media_service.entity.MediaFile;
import media_service.repository.MediaFileRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {
    
    private final MediaFileRepository mediaFileRepository;
    
    @Value("${app.media.upload-dir:./uploads}")
    private String uploadDir;
    
    @Value("${app.media.max-file-size:100MB}")
    private String maxFileSize;
    
    @Value("${server.port:8084}")
    private String serverPort;
    
    /**
     * Upload video file (for instructors)
     */
    @Transactional
    public MediaFileDto uploadVideo(MultipartFile file, MediaUploadRequest request, Long uploadedBy) {
        validateVideoFile(file);
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "videos");
            Files.createDirectories(uploadPath);
            
            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to disk
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Save file metadata to database
            MediaFile mediaFile = MediaFile.builder()
                    .fileName(fileName)
                    .originalFileName(originalFileName)
                    .filePath(filePath.toString())
                    .fileType("video")
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedBy(uploadedBy)
                    .courseId(request.getCourseId())
                    .description(request.getDescription())
                    .build();
            
            MediaFile savedFile = mediaFileRepository.save(mediaFile);
            return convertToDto(savedFile);
            
        } catch (IOException e) {
            log.error("Error uploading video file", e);
            throw new RuntimeException("Failed to upload video file");
        }
    }
    
    /**
     * Get videos by course ID
     */
    public List<MediaFileDto> getVideosByCourse(Long courseId) {
        return mediaFileRepository.findByCourseIdAndFileType(courseId, "video")
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all media files by course ID
     */
    public List<MediaFileDto> getMediaByCourse(Long courseId) {
        return mediaFileRepository.findByCourseId(courseId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get media files uploaded by user
     */
    public List<MediaFileDto> getMediaByUser(Long userId) {
        return mediaFileRepository.findByUploadedBy(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete media file
     */
    @Transactional
    public void deleteMedia(Long mediaId, Long userId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media file not found"));
        
        // Check if user is the owner or admin (you might want to add role check here)
        if (!mediaFile.getUploadedBy().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this media file");
        }
        
        try {
            // Delete file from disk
            Files.deleteIfExists(Paths.get(mediaFile.getFilePath()));
            
            // Delete from database
            mediaFileRepository.delete(mediaFile);
            
        } catch (IOException e) {
            log.error("Error deleting media file from disk", e);
            throw new RuntimeException("Failed to delete media file");
        }
    }
    
    /**
     * Get media file by ID
     */
    public MediaFileDto getMediaById(Long mediaId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media file not found"));
        return convertToDto(mediaFile);
    }
    
    /**
     * Validate video file
     */
    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new RuntimeException("File must be a video");
        }
        
        // Check file size (100MB limit)
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum size is 100MB");
        }
    }
    
    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
    
    /**
     * Convert MediaFile entity to DTO
     */
    private MediaFileDto convertToDto(MediaFile mediaFile) {
        String baseUrl = "http://localhost:" + serverPort + "/api/media";
        return MediaFileDto.builder()
                .id(mediaFile.getId())
                .fileName(mediaFile.getFileName())
                .originalFileName(mediaFile.getOriginalFileName())
                .filePath(mediaFile.getFilePath())
                .fileType(mediaFile.getFileType())
                .mimeType(mediaFile.getMimeType())
                .fileSize(mediaFile.getFileSize())
                .uploadedBy(mediaFile.getUploadedBy())
                .courseId(mediaFile.getCourseId())
                .description(mediaFile.getDescription())
                .createdAt(mediaFile.getCreatedAt())
                .updatedAt(mediaFile.getUpdatedAt())
                .downloadUrl(baseUrl + "/download/" + mediaFile.getId())
                .streamUrl(baseUrl + "/stream/" + mediaFile.getId())
                .build();
    }
}
