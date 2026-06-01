package com.intelliprep.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intelliprep.model.Interview;
import com.intelliprep.model.User;
import com.intelliprep.repository.InterviewRepository;
import com.intelliprep.repository.UserRepository;
import com.intelliprep.service.OpenRouterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final OpenRouterService openRouterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * POST /api/interview/resume
     * Accepts PDF resume, extracts text, sends to AI, returns structured data.
     */
    @PostMapping("/resume")
    public ResponseEntity<?> analyzeResume(@RequestParam("resume") MultipartFile file,
                                           HttpServletRequest request) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Resume required"));
            }

            // Extract text from PDF using PDFBox 3.x (Loader.loadPDF replaces PDDocument.load)
            String resumeText;
            byte[] pdfBytes = file.getBytes();
            try (PDDocument document = Loader.loadPDF(pdfBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                resumeText = stripper.getText(document);
            }

            resumeText = resumeText.replaceAll("\\s+", " ").trim();

            List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                    "Extract structured data from resume.\n\nReturn strictly JSON:\n\n" +
                    "{\n  \"role\": \"string\",\n  \"experience\": \"string\"," +
                    "\n  \"projects\": [\"project1\", \"project2\"]," +
                    "\n  \"skills\": [\"skill1\", \"skill2\"]\n}"),
                Map.of("role", "user", "content", resumeText)
            );

            String aiResponse = openRouterService.askAi(messages);

            // Strip markdown code fences if present
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode parsed = objectMapper.readTree(cleanJson);

            Map<String, Object> result = new HashMap<>();
            result.put("role", parsed.path("role").asText());
            result.put("experience", parsed.path("experience").asText());
            result.put("projects", parsed.path("projects"));
            result.put("skills", parsed.path("skills"));
            result.put("resumeText", resumeText);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/interview/generate-questions
     * Generates 5 interview questions using AI based on role, experience, mode, resume.
     */
    @PostMapping("/generate-questions")
    public ResponseEntity<?> generateQuestion(@RequestBody Map<String, Object> body,
                                              HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");

            String role = trim((String) body.get("role"));
            String experience = trim((String) body.get("experience"));
            String mode = trim((String) body.get("mode"));
            String resumeText = body.get("resumeText") != null ? ((String) body.get("resumeText")).trim() : "None";

            List<String> projects = body.get("projects") instanceof List
                    ? (List<String>) body.get("projects") : Collections.emptyList();
            List<String> skills = body.get("skills") instanceof List
                    ? (List<String>) body.get("skills") : Collections.emptyList();

            if (role == null || role.isEmpty() || experience == null || experience.isEmpty()
                    || mode == null || mode.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Role, Experience and Mode are required."));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found."));
            }
            if (user.getCredits() < 50) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Not enough credits. Minimum 50 required."));
            }

            String projectText = projects.isEmpty() ? "None" : String.join(", ", projects);
            String skillsText = skills.isEmpty() ? "None" : String.join(", ", skills);

            String userPrompt = String.format(
                "Role:%s\nExperience:%s\nInterviewMode:%s\nProjects:%s\nSkills:%s\nResume:%s",
                role, experience, mode, projectText, skillsText, resumeText
            );

            String systemPrompt =
                "You are a real human interviewer conducting a professional interview.\n\n" +
                "Speak in simple, natural English as if you are directly talking to the candidate.\n\n" +
                "Generate exactly 5 interview questions.\n\n" +
                "Strict Rules:\n" +
                "- Each question must contain between 15 and 25 words.\n" +
                "- Each question must be a single complete sentence.\n" +
                "- Do NOT number them.\n" +
                "- Do NOT add explanations.\n" +
                "- Do NOT add extra text before or after.\n" +
                "- One question per line only.\n" +
                "- Keep language simple and conversational.\n" +
                "- Questions must feel practical and realistic.\n\n" +
                "Difficulty progression:\n" +
                "Question 1 → easy\nQuestion 2 → easy\nQuestion 3 → medium\nQuestion 4 → medium\nQuestion 5 → hard\n\n" +
                "Make questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.";

            List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            );

            String aiResponse = openRouterService.askAi(messages);

            List<String> questionsArray = Arrays.stream(aiResponse.split("\n"))
                    .map(String::trim)
                    .filter(q -> !q.isEmpty())
                    .limit(5)
                    .collect(Collectors.toList());

            if (questionsArray.isEmpty()) {
                return ResponseEntity.status(500).body(Map.of("message", "AI failed to generate questions."));
            }

            // Deduct credits
            user.setCredits(user.getCredits() - 50);
            userRepository.save(user);

            // Build Interview document
            String[] difficulties = {"easy", "easy", "medium", "medium", "hard"};
            int[] timeLimits = {60, 60, 90, 90, 120};

            List<Interview.Question> questions = new ArrayList<>();
            for (int i = 0; i < questionsArray.size(); i++) {
                Interview.Question q = new Interview.Question();
                q.setQuestion(questionsArray.get(i));
                q.setDifficulty(difficulties[i]);
                q.setTimeLimit(timeLimits[i]);
                questions.add(q);
            }

            Interview interview = new Interview();
            interview.setUserId(userId);
            interview.setRole(role);
            interview.setExperience(experience);
            interview.setMode(mode);
            interview.setResumeText(resumeText);
            interview.setQuestions(questions);
            interview.setStatus("Incompleted");

            Interview saved = interviewRepository.save(interview);

            return ResponseEntity.ok(Map.of(
                "interviewId", saved.getId(),
                "creditsLeft", user.getCredits(),
                "userName", user.getName(),
                "questions", saved.getQuestions()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to create interview: " + e.getMessage()));
        }
    }

    /**
     * POST /api/interview/submit-answer
     * Evaluates a single answer using AI.
     */
    @PostMapping("/submit-answer")
    public ResponseEntity<?> submitAnswer(@RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        try {
            String interviewId = (String) body.get("interviewId");
            int questionIndex = (int) body.get("questionIndex");
            String answer = (String) body.get("answer");
            int timeTaken = (int) body.get("timeTaken");

            Interview interview = interviewRepository.findById(interviewId).orElse(null);
            if (interview == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Interview not found"));
            }

            Interview.Question question = interview.getQuestions().get(questionIndex);

            // No answer submitted
            if (answer == null || answer.isBlank()) {
                question.setScore(0);
                question.setFeedback("You did not submit an answer.");
                question.setAnswer("");
                interviewRepository.save(interview);
                return ResponseEntity.ok(Map.of("feedback", question.getFeedback()));
            }

            // Time exceeded
            if (timeTaken > question.getTimeLimit()) {
                question.setScore(0);
                question.setFeedback("Time limit exceeded. Answer not evaluated.");
                question.setAnswer(answer);
                interviewRepository.save(interview);
                return ResponseEntity.ok(Map.of("feedback", question.getFeedback()));
            }

            // Evaluate with AI
            String systemPrompt =
                "You are a professional human interviewer evaluating a candidate's answer in a real interview.\n\n" +
                "Evaluate naturally and fairly, like a real person would.\n\n" +
                "Score the answer in these areas (0 to 10):\n\n" +
                "1. Confidence – Does the answer sound clear, confident, and well-presented?\n" +
                "2. Communication – Is the language simple, clear, and easy to understand?\n" +
                "3. Correctness – Is the answer accurate, relevant, and complete?\n\n" +
                "Rules:\n- Be realistic and unbiased.\n- Do not give random high scores.\n" +
                "- If the answer is weak, score low.\n- If the answer is strong and detailed, score high.\n\n" +
                "Calculate:\nfinalScore = average of confidence, communication, and correctness (rounded to nearest whole number).\n\n" +
                "Feedback Rules:\n- Write natural human feedback.\n- 10 to 15 words only.\n" +
                "- Sound like real interview feedback.\n- Can suggest improvement if needed.\n" +
                "- Do NOT repeat the question.\n- Do NOT explain scoring.\n- Keep tone professional and honest.\n\n" +
                "Return ONLY valid JSON in this format:\n\n" +
                "{\n  \"confidence\": number,\n  \"communication\": number,\n  \"correctness\": number,\n" +
                "  \"finalScore\": number,\n  \"feedback\": \"short human feedback\"\n}";

            String userPrompt = "Question: " + question.getQuestion() + "\nAnswer: " + answer;

            List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            );

            String aiResponse = openRouterService.askAi(messages);
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode parsed = objectMapper.readTree(cleanJson);

            question.setAnswer(answer);
            question.setConfidence(parsed.path("confidence").asInt());
            question.setCommunication(parsed.path("communication").asInt());
            question.setCorrectness(parsed.path("correctness").asInt());
            question.setScore(parsed.path("finalScore").asInt());
            question.setFeedback(parsed.path("feedback").asText());

            interviewRepository.save(interview);

            return ResponseEntity.ok(Map.of("feedback", question.getFeedback()));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to submit answer: " + e.getMessage()));
        }
    }

    /**
     * POST /api/interview/finish
     * Calculates final scores and marks interview as completed.
     */
    @PostMapping("/finish")
    public ResponseEntity<?> finishInterview(@RequestBody Map<String, String> body,
                                             HttpServletRequest request) {
        try {
            String interviewId = body.get("interviewId");

            Interview interview = interviewRepository.findById(interviewId).orElse(null);
            if (interview == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "failed to find Interview"));
            }

            List<Interview.Question> questions = interview.getQuestions();
            int total = questions.size();

            double totalScore = 0, totalConfidence = 0, totalCommunication = 0, totalCorrectness = 0;

            for (Interview.Question q : questions) {
                totalScore += q.getScore() != null ? q.getScore() : 0;
                totalConfidence += q.getConfidence() != null ? q.getConfidence() : 0;
                totalCommunication += q.getCommunication() != null ? q.getCommunication() : 0;
                totalCorrectness += q.getCorrectness() != null ? q.getCorrectness() : 0;
            }

            double finalScore = total > 0 ? totalScore / total : 0;
            double avgConfidence = total > 0 ? totalConfidence / total : 0;
            double avgCommunication = total > 0 ? totalCommunication / total : 0;
            double avgCorrectness = total > 0 ? totalCorrectness / total : 0;

            interview.setFinalScore(finalScore);
            interview.setStatus("completed");
            interviewRepository.save(interview);

            List<Map<String, Object>> questionWiseScore = questions.stream().map(q -> {
                Map<String, Object> qMap = new LinkedHashMap<>();
                qMap.put("question", q.getQuestion());
                qMap.put("score", q.getScore() != null ? q.getScore() : 0);
                qMap.put("feedback", q.getFeedback() != null ? q.getFeedback() : "");
                qMap.put("confidence", q.getConfidence() != null ? q.getConfidence() : 0);
                qMap.put("communication", q.getCommunication() != null ? q.getCommunication() : 0);
                qMap.put("correctness", q.getCorrectness() != null ? q.getCorrectness() : 0);
                return qMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "finalScore", round1(finalScore),
                "confidence", round1(avgConfidence),
                "communication", round1(avgCommunication),
                "correctness", round1(avgCorrectness),
                "questionWiseScore", questionWiseScore
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to finish Interview: " + e.getMessage()));
        }
    }

    /**
     * GET /api/interview/get-interview
     * Returns list of interviews for the authenticated user.
     */
    @GetMapping("/get-interview")
    public ResponseEntity<?> getMyInterviews(HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");

            List<Interview> interviews = interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);

            List<Map<String, Object>> result = interviews.stream().map(i -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", i.getId());
                map.put("role", i.getRole());
                map.put("experience", i.getExperience());
                map.put("mode", i.getMode());
                map.put("finalScore", i.getFinalScore());
                map.put("status", i.getStatus());
                map.put("createdAt", i.getCreatedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to find currentUser Interview: " + e.getMessage()));
        }
    }

    /**
     * GET /api/interview/report/{id}
     * Returns full interview report with scores.
     */
    @GetMapping("/report/{id}")
    public ResponseEntity<?> getInterviewReport(@PathVariable String id,
                                                HttpServletRequest request) {
        try {
            Interview interview = interviewRepository.findById(id).orElse(null);
            if (interview == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Interview not found"));
            }

            List<Interview.Question> questions = interview.getQuestions();
            int total = questions.size();

            double totalConfidence = 0, totalCommunication = 0, totalCorrectness = 0;
            for (Interview.Question q : questions) {
                totalConfidence += q.getConfidence() != null ? q.getConfidence() : 0;
                totalCommunication += q.getCommunication() != null ? q.getCommunication() : 0;
                totalCorrectness += q.getCorrectness() != null ? q.getCorrectness() : 0;
            }

            return ResponseEntity.ok(Map.of(
                "finalScore", interview.getFinalScore(),
                "confidence", round1(total > 0 ? totalConfidence / total : 0),
                "communication", round1(total > 0 ? totalCommunication / total : 0),
                "correctness", round1(total > 0 ? totalCorrectness / total : 0),
                "questionWiseScore", questions
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to find Interview report: " + e.getMessage()));
        }
    }

    // Helper: trim null-safe
    private String trim(String s) {
        return s != null ? s.trim() : null;
    }

    // Helper: round to 1 decimal
    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}