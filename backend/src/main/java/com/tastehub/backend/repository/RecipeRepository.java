package com.tastehub.backend.repository;

import com.tastehub.backend.model.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface RecipeRepository extends MongoRepository<Recipe, String> {
}
