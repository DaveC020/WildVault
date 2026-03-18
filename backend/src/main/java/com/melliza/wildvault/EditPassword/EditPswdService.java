package com.melliza.wildvault.EditPassword;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class EditPswdService {

    private final ProfileRepository profileRepository;
    private final PswdEncoder pswdEncoder;

    public EditPswdService(ProfileRepository profileRepository, PswdEncoder pswdEncoder) {
        this.profileRepository = profileRepository;
        this.pswdEncoder = pswdEncoder;
    }

    public Map<String, Object> updatePassword(String username, EditPswdDTO request) {
        if (username == null || username.isBlank()) {
            return Map.of("status", 401, "message", "Invalid or missing token");
        }

        if (request == null || request.getCurrentPassword() == null || request.getNewPassword() == null || request.getConfirmPassword() == null) {
            return Map.of("status", 400, "message", "currentPassword, newPassword and confirmPassword are required");
        }

        String currentPassword = request.getCurrentPassword().trim();
        String newPassword = request.getNewPassword().trim();
        String confirmPassword = request.getConfirmPassword().trim();

        if (currentPassword.isBlank() || newPassword.isBlank() || confirmPassword.isBlank()) {
            return Map.of("status", 400, "message", "currentPassword, newPassword and confirmPassword must not be empty");
        }

        if (!newPassword.equals(confirmPassword)) {
            return Map.of("status", 400, "message", "newPassword and confirmPassword do not match");
        }

        Optional<RegisterEntity> userOptional = profileRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return Map.of("status", 404, "message", "User not found");
        }

        RegisterEntity user = userOptional.get();
        if (!pswdEncoder.matches(currentPassword, user.getPassword())) {
            return Map.of("status", 400, "message", "Current password is incorrect");
        }

        user.setPassword(pswdEncoder.encode(newPassword));
        profileRepository.save(user);

        return Map.of("status", 200, "message", "Password updated successfully");
    }
}
