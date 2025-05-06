package com.tastehub.backend.controller;

import com.tastehub.backend.model.Notification;
import com.tastehub.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {
    @Autowired
    private NotificationService service;

    @GetMapping
    public List<Notification> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Notification save(@RequestBody Notification notification) {
        return service.save(notification);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
