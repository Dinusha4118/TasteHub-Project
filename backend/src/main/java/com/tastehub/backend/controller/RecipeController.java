package com.tastehub.backend.controller;

import com.tastehub.backend.model.Recipe;
import com.tastehub.backend.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    // Create new recipe
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Recipe> createRecipe(
            @RequestPart("recipe") Recipe recipe,
            @RequestPart(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
            @RequestPart(value = "stepImages", required = false) MultipartFile[] stepImages) throws IOException {

        // Handle media files
        if (mediaFiles != null) {
            List<String> mediaFileIds = new ArrayList<>();
            for (MultipartFile file : mediaFiles) {
                String fileId = recipeService.storeFile(file);
                mediaFileIds.add(fileId);
            }
            recipe.setMediaFileIds(mediaFileIds);
        }

        // Handle step images
        if (stepImages != null && recipe.getSteps() != null) {
            for (int i = 0; i < stepImages.length && i < recipe.getSteps().size(); i++) {
                String fileId = recipeService.storeFile(stepImages[i]);
                recipe.getSteps().get(i).setImageFileId(fileId);
            }
        }

        Recipe savedRecipe = recipeService.saveRecipe(recipe);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe);
    }

    // Get single recipe by ID
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipe(@PathVariable String id) {
        return recipeService.getRecipeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all recipes
    @GetMapping
    public List<Recipe> getAllRecipes() {
        return recipeService.getAllRecipes();
    }

    // Delete recipe by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable String id) {
        // First delete associated media files
        recipeService.deleteRecipeMediaFiles(id);

        // Then delete the recipe
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    // Update existing recipe
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Recipe> updateRecipe(
            @PathVariable String id,
            @RequestPart("recipe") Recipe recipe,
            @RequestPart(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
            @RequestPart(value = "stepImages", required = false) MultipartFile[] stepImages) throws IOException {

        // Handle media files update
        if (mediaFiles != null) {
            // Delete old media files first
            recipeService.deleteRecipeMediaFiles(id);

            // Store new media files
            List<String> mediaFileIds = new ArrayList<>();
            for (MultipartFile file : mediaFiles) {
                String fileId = recipeService.storeFile(file);
                mediaFileIds.add(fileId);
            }
            recipe.setMediaFileIds(mediaFileIds);
        }

        // Handle step images update
        if (stepImages != null && recipe.getSteps() != null) {
            for (int i = 0; i < stepImages.length && i < recipe.getSteps().size(); i++) {
                // Delete old step image if exists
                if (recipe.getSteps().get(i).getImageFileId() != null) {
                    recipeService.deleteFile(recipe.getSteps().get(i).getImageFileId());
                }

                // Store new step image
                String fileId = recipeService.storeFile(stepImages[i]);
                recipe.getSteps().get(i).setImageFileId(fileId);
            }
        }

        recipe.setId(id);
        Recipe updatedRecipe = recipeService.saveRecipe(recipe);
        return ResponseEntity.ok(updatedRecipe);
    }
}