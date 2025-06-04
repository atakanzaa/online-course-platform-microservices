package media_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import media_service.entity.MediaFile;

import java.util.List;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByCourseId(Long courseId);
    List<MediaFile> findByUploadedBy(Long uploadedBy);
    List<MediaFile> findByCourseIdAndFileType(Long courseId, String fileType);
    List<MediaFile> findByFileType(String fileType);
}
