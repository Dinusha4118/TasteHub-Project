package com.tastehub.backend.model;

import lombok.Data;

@Data
public class Step {
    private String description;
    private String imageFileId; // Reference to GridFS file

    public String getDescription()
    {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    // Add getter and setter
    public String getImageFileId() {
        return imageFileId;
    }

    public void setImageFileId(String imageFileId) {
        this.imageFileId = imageFileId;
    }

}
