package com.melliza.wildvault.EditPassword;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class EditPswdService {

    private static final String STATUS_KEY = "status";
    private static final String MESSAGE_KEY = "message";

    private final EditPswdRepository profileRepository;
    private final PswdEncoder pswdEncoder;

    public EditPswdService(EditPswdRepository profileRepository, PswdEncoder pswdEncoder) {
        this.profileRepository = profileRepository;
        this.pswdEncoder = pswdEncoder;
    }

    public Map<String, Object> updatePassword(String username, EditPswdDTO request) {
        if (username == null || username.isBlank()) {
            return Map.of(STATUS_KEY, 401, MESSAGE_KEY, "Invalid or missing token");
        }

        if (request == null
                || request.getCurrentPassword() == null
                || request.getNewPassword() == null
                || request.getConfirmPassword() == null) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "currentPassword, newPassword, and confirmPassword are required");
        }

        String currentPassword = request.getCurrentPassword() == null ? "" : request.getCurrentPassword().trim();
        String newPassword = request.getNewPassword().trim();
        String confirmPassword = request.getConfirmPassword().trim();

        if (currentPassword.isBlank() || newPassword.isBlank() || confirmPassword.isBlank()) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "currentPassword, newPassword, and confirmPassword must not be empty");
        }

        if (!newPassword.equals(confirmPassword)) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "newPassword and confirmPassword do not match");
        }

        Optional<RegisterEntity> userOptional = profileRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return Map.of(STATUS_KEY, 404, MESSAGE_KEY, "User not found");
        }

        RegisterEntity user = userOptional.get();
        if (!pswdEncoder.matches(currentPassword, user.getPassword())) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "Current password is incorrect");
        }

        user.setPassword(pswdEncoder.encode(newPassword));
        profileRepository.save(user);

        return Map.of(STATUS_KEY, 200, MESSAGE_KEY, "Password updated successfully");
    }
}
