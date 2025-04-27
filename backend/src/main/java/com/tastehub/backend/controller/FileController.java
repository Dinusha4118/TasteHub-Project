package com.tastehub.backend.controller;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.tastehub.backend.service.RecipeService;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private GridFsOperations gridFsOperations;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable String id) throws IOException {
        GridFSFile file = recipeService.getFileById(id);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        GridFsResource resource = gridFsOperations.getResource(file);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        IOUtils.copy(resource.getInputStream(), outputStream);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getContentType()))
                .body(outputStream.toByteArray());
    }
}