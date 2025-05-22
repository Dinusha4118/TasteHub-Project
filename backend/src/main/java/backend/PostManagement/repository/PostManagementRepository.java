package backend.PostManagement.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.PostManagement.model.PostManagementModel;

public interface PostManagementRepository extends MongoRepository<PostManagementModel, String> {
    
    // Find all posts by a given user ID
    List<PostManagementModel> findByUserID(String userID);
    
    // Delete all posts by a given user ID
    void deleteByUserID(String userID);
}
