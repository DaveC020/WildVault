package com.melliza.wildvault.Profile;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Object> getProfile(Authentication authentication) {
        ProfileDTO profile = profileService.getProfileByUsername(authentication == null ? null : authentication.getName());
        if (profile != null) {
            return ResponseEntity.ok(profile);
        }
        return ResponseEntity.status(404).body(Map.of("message", "Profile not found"));
    }
}
