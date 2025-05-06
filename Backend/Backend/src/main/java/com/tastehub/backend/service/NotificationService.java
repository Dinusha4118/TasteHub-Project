package com.tastehub.backend.service;

import com.tastehub.backend.model.Notification;
import com.tastehub.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository repo;

    public List<Notification> getAll() {
        return repo.findAll();
    }

    public Notification save(Notification notification) {
        return repo.save(notification);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
