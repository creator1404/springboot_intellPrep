package com.intelliprep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Send messages to OpenRouter AI and get a response.
     * messages format: List of Map with "role" and "content" keys.
     */
    public String askAi(List<Map<String, String>> messages) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);

            ArrayNode messagesArray = objectMapper.createArrayNode();
            for (Map<String, String> msg : messages) {
                ObjectNode msgNode = objectMapper.createObjectNode();
                msgNode.put("role", msg.get("role"));
                msgNode.put("content", msg.get("content"));
                messagesArray.add(msgNode);
            }
            requestBody.set("messages", messagesArray);

            String json = objectMapper.writeValueAsString(requestBody);

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(RequestBody.create(json, MediaType.get("application/json")))
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new RuntimeException("OpenRouter API error: " + response.code());
                }
                String responseBody = response.body().string();
                JsonNode parsed = objectMapper.readTree(responseBody);
                String content = parsed.path("choices").get(0).path("message").path("content").asText();

                if (content == null || content.isBlank()) {
                    throw new RuntimeException("AI returned empty response.");
                }
                return content;
            }
        } catch (Exception e) {
            throw new RuntimeException("OpenRouter API Error: " + e.getMessage(), e);
        }
    }
}
