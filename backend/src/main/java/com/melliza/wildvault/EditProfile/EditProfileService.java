package com.melliza.wildvault.EditProfile;

import org.springframework.stereotype.Service;

import com.melliza.wildvault.Profile.ProfileEntity;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EditProfileService {

    private final EditProfileRepository profileRepository;

    public EditProfileService(EditProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Map<String, Object> updateProfile(String username, EditProfileDTO request) {
        if (username == null || username.isBlank()) {
            return Map.of("authError", true);
        }

        if (request == null) {
            return Map.of("error", "Request body is required");
        }

        Optional<ProfileEntity> userOptional = profileRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return Map.of("authError", true);
        }

        ProfileEntity user = userOptional.get();

        if (request.getStudentId() != null && !request.getStudentId().trim().isBlank()) {
            String immutableStudentId = user.getStudentId() == null ? "" : user.getStudentId().trim();
            if (!request.getStudentId().trim().equalsIgnoreCase(immutableStudentId)) {
                return Map.of("error", "Student ID cannot be changed");
            }
        }

        if (request.getFullName() != null && !request.getFullName().trim().isBlank()) {
            String immutableFullName = user.getFullName() == null ? "" : user.getFullName().trim();
            if (!request.getFullName().trim().equalsIgnoreCase(immutableFullName)) {
                return Map.of("error", "Full name cannot be changed");
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isBlank()) {
            String immutableEmail = user.getEmail() == null ? "" : user.getEmail().trim();
            if (!request.getEmail().trim().equalsIgnoreCase(immutableEmail)) {
                return Map.of("error", "Email cannot be changed");
            }
        }

        String requestedDisplayName = request.getDisplayName() == null ? "" : request.getDisplayName().trim();
        if (requestedDisplayName.isBlank()) {
            return Map.of("error", "Display name is required");
        }

        if (!requestedDisplayName.equals(user.getDisplayName())) {
            user.setDisplayName(requestedDisplayName);
        }

        ProfileEntity savedUser = profileRepository.save(user);

        Map<String, Object> userPayload = new LinkedHashMap<>();
        userPayload.put("id", savedUser.getId());
        userPayload.put("studentId", savedUser.getStudentId());
        userPayload.put("username", savedUser.getUsername());
        userPayload.put("displayName", savedUser.getDisplayName());
        userPayload.put("email", savedUser.getEmail());
        userPayload.put("fullName", savedUser.getFullName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("user", userPayload);
        return response;
    }
}
