package com.melliza.wildvault.EditProfile;

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
public class EditProfileController {

    private final EditProfileService editProfileService;

    public EditProfileController(EditProfileService editProfileService) {
        this.editProfileService = editProfileService;
    }

    @PutMapping("/profile")
    public ResponseEntity<Object> editProfile(
            Authentication authentication,
            @RequestBody EditProfileDTO request
    ) {
        Map<String, Object> result = editProfileService.updateProfile(authentication == null ? null : authentication.getName(), request);
        if (result.containsKey("authError")) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or missing token"));
        }
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(Map.of("message", result.get("error")));
        }
        return ResponseEntity.ok(result);
    }
}
