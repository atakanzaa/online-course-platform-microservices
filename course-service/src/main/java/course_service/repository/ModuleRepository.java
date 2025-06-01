package course_service.repository;

import course_service.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, Long> {
} 