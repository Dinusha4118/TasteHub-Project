package backend.PostManagement.controller;

import backend.exception.ResourceNotFoundException;
import backend.PostManagement.model.PostManagementModel;
import backend.Notification.model.NotificationModel;
import backend.PostManagement.model.Comment;
import backend.PostManagement.repository.PostManagementRepository;
import backend.Notification.repository.NotificationRepository;
import backend.User.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/posts")
public class PostManagementController {

    @Autowired
    private PostManagementRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${media.upload.dir}")
    private String uploadDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createPost(
            @RequestParam String userID,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String ingredients,
            @RequestParam String steps,
            @RequestParam String tags,
            @RequestParam int cookingTime,
            @RequestParam String difficulty,
            @RequestParam int servings,
            @RequestParam List<MultipartFile> mediaFiles,
            @RequestParam(value = "stepImages", required = false) List<MultipartFile> stepImages
    ) {
        if (mediaFiles.size() < 1 || mediaFiles.size() > 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("You must upload between 1 and 3 media files.");
        }

        File dir = new File(uploadDir.isBlank() ? System.getProperty("user.dir") : uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create upload directory.");
        }

      final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);

      // Ensure the upload directory exists
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs();
            if (!created) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
            }
        }

       List<String> mediaUrls = mediaFiles.stream()
                .filter(file -> file.getContentType().matches("image/(jpeg|png|jpg)|video/mp4"))
                .map(file -> {
                    try {
                        // Generate a unique filename
                        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;

                        Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                        file.transferTo(filePath.toFile());
                        return "/media/" + uniqueFileName; // URL to access the file
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());


        List<PostManagementModel.Ingredient> ingredientList;
        List<PostManagementModel.Step> stepList;
        List<String> tagList;
        try {
            ingredientList = objectMapper.readValue(ingredients,
                    new TypeReference<List<PostManagementModel.Ingredient>>() {});
            stepList = objectMapper.readValue(steps,
                    new TypeReference<List<PostManagementModel.Step>>() {});
            tagList = objectMapper.readValue(tags,
                    new TypeReference<List<String>>() {});
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid JSON for ingredients, steps, or tags.");
        }

        if (stepImages != null) {
            for (int i = 0; i < stepImages.size() && i < stepList.size(); i++) {
                String url = storeFile(dir, stepImages.get(i));
                if (url != null) stepList.get(i).setImageUrl(url);
            }
        }

        PostManagementModel post = new PostManagementModel();
        post.setUserID(userID);
        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);
        post.setMedia(mediaUrls);
        post.setIngredients(ingredientList);
        post.setSteps(stepList);
        post.setTags(tagList);
        post.setCookingTime(cookingTime);
        post.setDifficulty(difficulty);
        post.setServings(servings);

        PostManagementModel saved = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<PostManagementModel> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/user/{userID}")
    public List<PostManagementModel> getPostsByUser(@PathVariable String userID) {
        return postRepository.findByUserID(userID);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String ingredients,
            @RequestParam String steps,
            @RequestParam String tags,
            @RequestParam int cookingTime,
            @RequestParam String difficulty,
            @RequestParam int servings,
            @RequestParam(required = false) List<MultipartFile> newMediaFiles,
            @RequestParam(required = false) List<MultipartFile> newStepImages
    ) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);
        post.setCookingTime(cookingTime);
        post.setDifficulty(difficulty);
        post.setServings(servings);

        try {
            post.setIngredients(objectMapper.readValue(ingredients,
                    new TypeReference<List<PostManagementModel.Ingredient>>() {}));
            post.setSteps(objectMapper.readValue(steps,
                    new TypeReference<List<PostManagementModel.Step>>() {}));
            post.setTags(objectMapper.readValue(tags,
                    new TypeReference<List<String>>() {}));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid JSON for ingredients, steps, or tags.");
        }

        if (newMediaFiles != null) {
            File dir = new File(uploadDir.isBlank() ? System.getProperty("user.dir") : uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to create upload directory.");
            }
            List<String> urls = newMediaFiles.stream()
                    .map(file -> storeFile(dir, file))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            post.getMedia().addAll(urls);
        }

        if (newStepImages != null) {
            File dir = new File(uploadDir.isBlank() ? System.getProperty("user.dir") : uploadDir);
            for (int i = 0; i < newStepImages.size() && i < post.getSteps().size(); i++) {
                String url = storeFile(dir, newStepImages.get(i));
                if (url != null) post.getSteps().get(i).setImageUrl(url);
            }
        }

        postRepository.save(post);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        post.getMedia().forEach(this::deleteFile);
        post.getSteps().stream()
                .map(PostManagementModel.Step::getImageUrl)
                .filter(Objects::nonNull)
                .forEach(this::deleteFile);

        postRepository.deleteById(postId);
        return ResponseEntity.ok("Post deleted successfully!");
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<PostManagementModel> likePost(
            @PathVariable String postId,
            @RequestParam String userID
    ) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getLikes().put(userID,
                            !post.getLikes().getOrDefault(userID, false));
                    postRepository.save(post);
                    if (!userID.equals(post.getUserID())) {
                        String userFullName = userRepository.findById(userID)
                                .map(u -> u.getFullname())
                                .orElse("Someone");
                        String message = String.format("%s liked your post '%s'",
                                userFullName, post.getTitle());
                        String timestamp = LocalDateTime.now()
                                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(
                                post.getUserID(), message, false, timestamp);
                        notificationRepository.save(notification);
                    }
                    return ResponseEntity.ok(post);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostManagementModel> addComment(
            @PathVariable String postId,
            @RequestBody Map<String, String> req
    ) {
        String userID = req.get("userID");
        String content = req.get("content");
        return postRepository.findById(postId)
                .map(post -> {
                    Comment c = new Comment();
                    c.setId(UUID.randomUUID().toString());
                    c.setUserID(userID);
                    c.setContent(content);
                    String fullName = userRepository.findById(userID)
                            .map(u -> u.getFullname())
                            .orElse("Anonymous");
                    c.setUserFullName(fullName);
                    post.getComments().add(c);
                    postRepository.save(post);
                    if (!userID.equals(post.getUserID())) {
                        String msg = String.format("%s commented on your post '%s'",
                                fullName, post.getTitle());
                        String ts = LocalDateTime.now()
                                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        notificationRepository.save(
                                new NotificationModel(post.getUserID(), msg, false, ts));
                    }
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> req
    ) {
        String userID = req.get("userID");
        String content = req.get("content");
        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().stream()
                            .filter(c -> c.getId().equals(commentId)
                                    && c.getUserID().equals(userID))
                            .findFirst()
                            .ifPresent(c -> c.setContent(content));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userID
    ) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().removeIf(c -> c.getId().equals(commentId)
                            && (c.getUserID().equals(userID) || post.getUserID().equals(userID)));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSize(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("File size exceeds the maximum limit!");
    }

    private String storeFile(File uploadDirectory, MultipartFile file) {
        try {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String name = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + "." + ext;
            Path path = uploadDirectory.toPath().resolve(name);
            file.transferTo(path.toFile());
            return "/media/" + name;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void deleteFile(String mediaUrl) {
        try {
            String fileName = mediaUrl.replace("/media/", "");
            Path path = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }
}
