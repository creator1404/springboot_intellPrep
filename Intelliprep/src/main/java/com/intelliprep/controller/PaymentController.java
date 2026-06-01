package com.intelliprep.controller;

import com.intelliprep.model.Payment;
import com.intelliprep.model.User;
import com.intelliprep.repository.PaymentRepository;
import com.intelliprep.repository.UserRepository;
import com.intelliprep.service.RazorpayService;
import com.razorpay.Order;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final RazorpayService razorpayService;

    /**
     * POST /api/payment/order
     * Creates a Razorpay order and stores payment record.
     */
    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body,
                                         HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");

            String planId = (String) body.get("planId");
            double amount = Double.parseDouble(body.get("amount").toString());
            int credits = Integer.parseInt(body.get("credits").toString());

            if (amount <= 0 || credits <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid plan data"));
            }

            // Create Razorpay order (amount in paise)
            JSONObject options = new JSONObject();
            options.put("amount", (int)(amount * 100));
            options.put("currency", "INR");
            options.put("receipt", "receipt_" + System.currentTimeMillis());

            Order order = razorpayService.getClient().orders.create(options);

            // Store payment record
            Payment payment = new Payment();
            payment.setUserId(userId);
            payment.setPlanId(planId);
            payment.setAmount(amount);
            payment.setCredits(credits);
            payment.setRazorpayOrderId(order.get("id"));
            payment.setStatus("created");
            paymentRepository.save(payment);

            // Return Razorpay order object as map
            return ResponseEntity.ok(order.toJson().toMap());

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to create Razorpay order: " + e.getMessage()));
        }
    }

    /**
     * POST /api/payment/verify
     * Verifies Razorpay payment signature and credits user.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body,
                                           HttpServletRequest request) {
        try {
            String razorpayOrderId = body.get("razorpay_order_id");
            String razorpayPaymentId = body.get("razorpay_payment_id");
            String razorpaySignature = body.get("razorpay_signature");

            // Verify signature
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            String expectedSignature = hmacSHA256(data, razorpayService.getKeySecret());

            if (!expectedSignature.equals(razorpaySignature)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid payment signature"));
            }

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (payment == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Payment not found"));
            }

            if ("paid".equals(payment.getStatus())) {
                return ResponseEntity.ok(Map.of("message", "Already processed"));
            }

            // Update payment
            payment.setStatus("paid");
            payment.setRazorpayPaymentId(razorpayPaymentId);
            paymentRepository.save(payment);

            // Add credits to user
            User user = userRepository.findById(payment.getUserId()).orElse(null);
            if (user != null) {
                user.setCredits(user.getCredits() + payment.getCredits());
                userRepository.save(user);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified and credits added",
                "user", user
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "failed to verify Razorpay payment: " + e.getMessage()));
        }
    }

    // HMAC-SHA256 signature verification (replaces Node's crypto.createHmac)
    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
