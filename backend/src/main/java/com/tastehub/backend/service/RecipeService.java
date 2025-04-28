package com.tastehub.backend.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.tastehub.backend.model.Recipe;
import com.tastehub.backend.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    public Recipe saveRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public Optional<Recipe> getRecipeById(String id) {
        return recipeRepository.findById(id);
    }

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public void deleteRecipe(String id) {
        recipeRepository.deleteById(id);
    }

    public String storeFile(MultipartFile file) throws IOException {
        return gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType()).toString();
    }

    public GridFSFile getFileById(String id) {
        return gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));
    }

    public void deleteFileById(String id) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(id)));
    }

    public void deleteRecipeMediaFiles(String recipeId) {
        getRecipeById(recipeId).ifPresent(recipe -> {
            if (recipe.getMediaFileIds() != null) {
                recipe.getMediaFileIds().forEach(this::deleteFile);
            }
            if (recipe.getSteps() != null) {
                recipe.getSteps().stream()
                        .filter(step -> step.getImageFileId() != null)
                        .forEach(step -> deleteFile(step.getImageFileId()));
            }
        });

    }

    public void deleteFile(String fileId) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(fileId)));
    }
}
