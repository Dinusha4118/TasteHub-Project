package backend.Achievements.controller;

import backend.exception.ResourceNotFoundException;
import backend.Achievements.model.AchievementsModel;
import backend.Achievements.repository.AchievementsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import jakarta.annotation.PostConstruct;

@RestController
@CrossOrigin("http://localhost:3000")
public class AchievementsController {

    @Autowired
    private AchievementsRepository achievementsRepository;

    private final Path root = Paths.get("uploads/achievementsPost");

    // Create the directory if it doesn't exist
    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!", e);
        }
    }

    // Insert achievement
    @PostMapping("/achievements")
    public AchievementsModel newAchievementsModel(@RequestBody AchievementsModel newAchievementsModel) {
        return achievementsRepository.save(newAchievementsModel);
    }

    // Upload image
    @PostMapping("/achievements/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    // Get all achievements
    @GetMapping("/achievements")
    public List<AchievementsModel> getAll() {
        return achievementsRepository.findAll();
    }

    // Get achievement by ID
    @GetMapping("/achievements/{id}")
    public AchievementsModel getById(@PathVariable String id) {
        return achievementsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    // Update achievement
    @PutMapping("/achievements/{id}")
    public AchievementsModel update(@RequestBody AchievementsModel newAchievementsModel, @PathVariable String id) {
        return achievementsRepository.findById(id)
                .map(achievementsModel -> {
                    achievementsModel.setTitle(newAchievementsModel.getTitle());
                    achievementsModel.setDescription(newAchievementsModel.getDescription());
                    achievementsModel.setPostOwnerID(newAchievementsModel.getPostOwnerID());
                    achievementsModel.setPostOwnerName(newAchievementsModel.getPostOwnerName());
                    achievementsModel.setDate(newAchievementsModel.getDate());
                    achievementsModel.setCategory(newAchievementsModel.getCategory());
                    achievementsModel.setImageUrl(newAchievementsModel.getImageUrl());
                    return achievementsRepository.save(achievementsModel);
                }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    // Delete achievement
    @DeleteMapping("/achievements/{id}")
    public void delete(@PathVariable String id) {
        achievementsRepository.deleteById(id);
    }

    // Serve uploaded images
    @GetMapping("/achievements/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Could not read the file!");
            }

            String contentType = Files.probeContentType(file);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage(), e);
        }
    }
}
