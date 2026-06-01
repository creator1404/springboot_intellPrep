package com.intelliprep.repository;

import com.intelliprep.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {
    List<Interview> findByUserIdOrderByCreatedAtDesc(String userId);
}
