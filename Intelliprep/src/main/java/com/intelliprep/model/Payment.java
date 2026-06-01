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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("planId")
    private String planId;

    @Field("amount")
    private Double amount;

    @Field("credits")
    private Integer credits;

    @Field("razorpayOrderId")
    private String razorpayOrderId;

    @Field("razorpayPaymentId")
    private String razorpayPaymentId;

    @Field("status")
    private String status = "created"; // "created", "paid", "failed"

    @CreatedDate
    @Field("createdAt")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
