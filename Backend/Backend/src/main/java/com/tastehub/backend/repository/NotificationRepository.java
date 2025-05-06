package com.tastehub.backend.repository;

import com.tastehub.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface NotificationRepository extends MongoRepository<Notification, String> {
}
