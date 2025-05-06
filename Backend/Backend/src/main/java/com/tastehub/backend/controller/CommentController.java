package com.tastehub.backend.controller;

import com.tastehub.backend.model.Comment;
import com.tastehub.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin
public class CommentController {
    @Autowired
    private CommentService service;

    @GetMapping
    public List<Comment> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Comment save(@RequestBody Comment comment) {
        return service.save(comment);
    }

    @PutMapping("/{id}")
    public Comment update(@PathVariable String id, @RequestBody Comment comment) {
        return service.update(id, comment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
