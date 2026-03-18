package com.melliza.wildvault.Login;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "http://localhost:5173") // Assuming React dev server like Vite defaults to 5173
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginDTO loginDTO) {
        String token = loginService.authenticateAndGenerateToken(loginDTO);
        if (token != null) {
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "tokenType", "Bearer"
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }
}
