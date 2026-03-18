package com.melliza.wildvault.EditPassword;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class EditPswdController {

    private final EditPswdService editPswdService;

    public EditPswdController(EditPswdService editPswdService) {
        this.editPswdService = editPswdService;
    }

    @PutMapping("/profile/password")
    public ResponseEntity<Map<String, String>> editPassword(
            Authentication authentication,
            @RequestBody EditPswdDTO request
    ) {
        Map<String, Object> result = editPswdService.updatePassword(authentication == null ? null : authentication.getName(), request);
        int status = (int) result.getOrDefault("status", 400);
        String message = (String) result.getOrDefault("message", "Unable to update password");
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
