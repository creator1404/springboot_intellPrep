package com.intelliprep.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("role")
    private String role;

    @Field("experience")
    private String experience;

    @Field("mode")
    private String mode; // "HR" or "Technical"

    @Field("resumeText")
    private String resumeText;

    @Field("questions")
    private List<Question> questions;

    @Field("finalScore")
    private Double finalScore = 0.0;

    @Field("status")
    private String status = "Incompleted"; // "Incompleted" or "completed"

    @CreatedDate
    @Field("createdAt")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updatedAt")
    private LocalDateTime updatedAt;

    // ---- Embedded Question document ----
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String question;
        private String difficulty;
        private Integer timeLimit;
        private String answer;
        private String feedback;
        private Integer score = 0;
        private Integer confidence = 0;
        private Integer communication = 0;
        private Integer correctness = 0;
    }
}
