package com.melliza.wildvault.EditPassword;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

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

        if (currentPassword.equals(newPassword)) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "New password must be different from current password");
        }

        String passwordError = validatePassword(newPassword);
        if (passwordError != null) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, passwordError);
        }

        Optional<RegisterEntity> userOptional;
        try {
            userOptional = profileRepository.findByUsername(username);
        } catch (DataAccessException ex) {
            return Map.of(STATUS_KEY, 500, MESSAGE_KEY, "Unable to load user due to a database error");
        }

        if (userOptional.isEmpty()) {
            return Map.of(STATUS_KEY, 404, MESSAGE_KEY, "User not found");
        }

        RegisterEntity user = userOptional.get();
        String storedPassword = user.getPassword();
        if (storedPassword == null || storedPassword.isBlank()) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "No password is set for this account");
        }

        boolean passwordMatched;
        try {
            passwordMatched = pswdEncoder.matches(currentPassword, storedPassword);
        } catch (IllegalArgumentException ex) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "Stored password format is invalid. Please reset your password.");
        }

        if (!passwordMatched) {
            return Map.of(STATUS_KEY, 400, MESSAGE_KEY, "Current password is incorrect");
        }

        user.setPassword(pswdEncoder.encode(newPassword));
        try {
            profileRepository.save(user);
        } catch (DataAccessException ex) {
            return Map.of(STATUS_KEY, 500, MESSAGE_KEY, "Unable to update password due to a database error");
        }

        return Map.of(STATUS_KEY, 200, MESSAGE_KEY, "Password updated successfully");
    }

    private String validatePassword(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            return "Password must contain at least 1 uppercase letter";
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            return "Password must contain at least 1 lowercase letter";
        }
        if (!Pattern.compile("\\d").matcher(password).find()) {
            return "Password must contain at least 1 number";
        }
        if (!Pattern.compile("[^A-Za-z0-9]").matcher(password).find()) {
            return "Password must contain at least 1 special character";
        }
        return null;
    }
}
