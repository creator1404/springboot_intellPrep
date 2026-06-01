# IntelliPrep.AI — Spring Boot Backend

Converted from Node.js/Express to Spring Boot 3.2 (Java 17).

## Project Structure

```
src/main/java/com/intelliprep/
├── IntelliPrepApplication.java        ← Main entry point
├── config/
│   ├── JwtUtil.java                   ← JWT token generation & validation
│   ├── MongoConfig.java               ← MongoDB auditing
│   └── SecurityConfig.java            ← Spring Security + CORS config
├── middleware/
│   └── JwtAuthFilter.java             ← Replaces isAuth.js middleware
├── model/
│   ├── User.java                      ← User MongoDB document
│   ├── Interview.java                 ← Interview + embedded Question
│   └── Payment.java                   ← Payment MongoDB document
├── repository/
│   ├── UserRepository.java
│   ├── InterviewRepository.java
│   └── PaymentRepository.java
├── service/
│   ├── OpenRouterService.java         ← Replaces openRouter.service.js
│   └── RazorpayService.java           ← Replaces razorpay.service.js
└── controller/
    ├── AuthController.java            ← /api/auth/google, /api/auth/logout
    ├── UserController.java            ← /api/user/current-user
    ├── InterviewController.java       ← /api/interview/*
    └── PaymentController.java         ← /api/payment/*
```

## API Endpoints (1:1 match with original)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/google | ❌ | Google login / register |
| GET | /api/auth/logout | ❌ | Logout (clears cookie) |
| GET | /api/user/current-user | ✅ | Get logged-in user |
| POST | /api/interview/resume | ✅ | Upload & analyze resume PDF |
| POST | /api/interview/generate-questions | ✅ | Generate 5 AI questions |
| POST | /api/interview/submit-answer | ✅ | Submit & evaluate answer |
| POST | /api/interview/finish | ✅ | Finish interview, get final score |
| GET | /api/interview/get-interview | ✅ | Get user's interview history |
| GET | /api/interview/report/{id} | ✅ | Get full interview report |
| POST | /api/payment/order | ✅ | Create Razorpay order |
| POST | /api/payment/verify | ✅ | Verify payment & add credits |

## Setup

### 1. Create `.env` or set environment variables

```bash
MONGODB_URL=mongodb://localhost:27017/intelliprep
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CORS_ORIGIN=http://localhost:5173
```

Or update `src/main/resources/application.properties` directly.

### 2. Run the project

```bash
# With Maven
mvn spring-boot:run

# Or build JAR and run
mvn clean package
java -jar target/intelliprep-1.0.0.jar
```

Server starts on **port 6000** (same as original Node server).

### 3. Frontend (React) — No changes needed!
The React client works as-is. It calls the same API endpoints.
Just make sure Vite proxy or axios baseURL points to `http://localhost:6000`.

## Key Conversions

| Node.js | Spring Boot |
|---------|-------------|
| Express Router | @RestController + @RequestMapping |
| Mongoose Schema | @Document (Spring Data MongoDB) |
| jsonwebtoken | jjwt (io.jsonwebtoken) |
| multer (PDF upload) | @RequestParam MultipartFile |
| pdfjs-dist | Apache PDFBox |
| axios (OpenRouter) | OkHttp |
| razorpay npm | razorpay-java SDK |
| crypto.createHmac | javax.crypto.Mac |
| cookie-parser | Spring HttpServletRequest cookies |
| cors middleware | Spring CorsConfigurationSource |
| isAuth middleware | JwtAuthFilter (OncePerRequestFilter) |
