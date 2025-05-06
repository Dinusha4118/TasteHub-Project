package com.tastehub.backend.service;

import com.tastehub.backend.model.Comment;
import com.tastehub.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    @Autowired
    private CommentRepository repo;

    public List<Comment> getAll() {
        return repo.findAll();
    }

    public Comment save(Comment comment) {
        return repo.save(comment);
    }

    public Comment update(String id, Comment updated) {
        Comment c = repo.findById(id).orElseThrow();
        c.setContent(updated.getContent());
        c.setStatus(updated.getStatus());
        return repo.save(c);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
