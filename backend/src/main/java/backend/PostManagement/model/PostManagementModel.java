package backend.PostManagement.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
public class PostManagementModel {
    @Id
    private String id;
    private String userID;
    private String title;
    private String description;
    private String category;
    private List<String> media;
    private List<Ingredient> ingredients;
    private List<Step> steps;
    private List<String> tags;
    private int cookingTime;
    private String difficulty;
    private int servings;
    private Map<String, Boolean> likes = new HashMap<>();
    private List<Comment> comments = new ArrayList<>();

    // Default constructor
    public PostManagementModel() {
        this.media = new ArrayList<>();
        this.ingredients = new ArrayList<>();
        this.steps = new ArrayList<>();
        this.tags = new ArrayList<>();
    }

    // Full constructor
    public PostManagementModel(String id,
                               String userID,
                               String title,
                               String description,
                               String category,
                               List<String> media,
                               List<Ingredient> ingredients,
                               List<Step> steps,
                               List<String> tags,
                               int cookingTime,
                               String difficulty,
                               int servings) {
        this.id = id;
        this.userID = userID;
        this.title = title;
        this.description = description;
        this.category = category;
        this.media = media;
        this.ingredients = ingredients;
        this.steps = steps;
        this.tags = tags;
        this.cookingTime = cookingTime;
        this.difficulty = difficulty;
        this.servings = servings;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

   public List<String> getMedia() {
        return media;
    }

    public void setMedia(List<String> media) {
        this.media = media;
    }
    
    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public int getCookingTime() {
        return cookingTime;
    }

    public void setCookingTime(int cookingTime) {
        this.cookingTime = cookingTime;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getServings() {
        return servings;
    }

    public void setServings(int servings) {
        this.servings = servings;
    }

    public Map<String, Boolean> getLikes() {
        return likes;
    }

    public void setLikes(Map<String, Boolean> likes) {
        this.likes = likes;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    // Inner classes for Ingredient and Step
    public static class Ingredient {
        private String quantity;
        private String unit;
        private String name;

        public Ingredient() {}

        public Ingredient(String quantity, String unit, String name) {
            this.quantity = quantity;
            this.unit = unit;
            this.name = name;
        }

        public String getQuantity() {
            return quantity;
        }

        public void setQuantity(String quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class Step {
        private String description;
        private String imageUrl;

        public Step() {}

        public Step(String description, String imageUrl) {
            this.description = description;
            this.imageUrl = imageUrl;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
