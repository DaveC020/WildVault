package com.melliza.wildvault.UploadProfilePhoto;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UploadProfilePhotoController {

    private final UploadProfilePhotoService uploadProfilePhotoService;

    public UploadProfilePhotoController(UploadProfilePhotoService uploadProfilePhotoService) {
        this.uploadProfilePhotoService = uploadProfilePhotoService;
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<UploadProfilePhotoDTO> uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        UploadProfilePhotoDTO response = uploadProfilePhotoService.uploadProfilePhoto(authentication == null ? null : authentication.getName(), file);

        if ("Profile photo uploaded successfully".equals(response.getMessage())) {
            return ResponseEntity.ok(response);
        }

        if ("Invalid or missing token".equals(response.getMessage())) {
            return ResponseEntity.status(401).body(response);
        }

        if ("User profile not found".equals(response.getMessage())) {
            return ResponseEntity.status(404).body(response);
        }

        return ResponseEntity.badRequest().body(response);
    }
}
