package com.tastehub.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    private String title;
    private String message;
    private String audience;
    private String status;
    private LocalDateTime sentTime;
}
