package media_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import media_service.dto.MediaFileDto;
import media_service.dto.MediaUploadRequest;
import media_service.service.MediaService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {
    
    private final MediaService mediaService;
    
    /**
     * Upload video (for instructors)
     */
    @PostMapping("/upload/video")
    public ResponseEntity<MediaFileDto> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("X-User-Id") Long userId) {
        
        MediaUploadRequest request = new MediaUploadRequest();
        request.setCourseId(courseId);
        request.setDescription(description);
        
        MediaFileDto result = mediaService.uploadVideo(file, request, userId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get videos by course
     */
    @GetMapping("/course/{courseId}/videos")
    public ResponseEntity<List<MediaFileDto>> getVideosByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(mediaService.getVideosByCourse(courseId));
    }
    
    /**
     * Get all media by course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<MediaFileDto>> getMediaByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(mediaService.getMediaByCourse(courseId));
    }
    
    /**
     * Get media by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MediaFileDto>> getMediaByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(mediaService.getMediaByUser(userId));
    }
    
    /**
     * Get media file details
     */
    @GetMapping("/{mediaId}")
    public ResponseEntity<MediaFileDto> getMediaById(@PathVariable Long mediaId) {
        return ResponseEntity.ok(mediaService.getMediaById(mediaId));
    }
    
    /**
     * Download media file
     */
    @GetMapping("/download/{mediaId}")
    public ResponseEntity<Resource> downloadMedia(@PathVariable Long mediaId) {
        try {
            MediaFileDto mediaFile = mediaService.getMediaById(mediaId);
            Path filePath = Paths.get(mediaFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(mediaFile.getMimeType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                               "attachment; filename=\"" + mediaFile.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found", e);
        }
    }
    
    /**
     * Stream video file
     */
    @GetMapping("/stream/{mediaId}")
    public ResponseEntity<Resource> streamVideo(@PathVariable Long mediaId) {
        try {
            MediaFileDto mediaFile = mediaService.getMediaById(mediaId);
            
            if (!"video".equals(mediaFile.getFileType())) {
                throw new RuntimeException("File is not a video");
            }
            
            Path filePath = Paths.get(mediaFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(mediaFile.getMimeType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                        .body(resource);
            } else {
                throw new RuntimeException("Video file not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Video file not found", e);
        }
    }
    
    /**
     * Delete media file
     */
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @PathVariable Long mediaId,
            @RequestHeader("X-User-Id") Long userId) {
        mediaService.deleteMedia(mediaId, userId);
        return ResponseEntity.noContent().build();
    }
}
