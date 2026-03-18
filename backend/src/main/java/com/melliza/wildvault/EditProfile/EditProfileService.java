package com.melliza.wildvault.EditProfile;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EditProfileService {

    private final ProfileRepository profileRepository;

    public EditProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Map<String, Object> updateProfile(String username, EditProfileDTO request) {
        if (username == null || username.isBlank()) {
            return Map.of("authError", true);
        }

        Optional<ProfileEntity> userOptional = profileRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return Map.of("authError", true);
        }

        ProfileEntity user = userOptional.get();

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null) {
            String updatedEmail = request.getEmail().trim();
            if (!updatedEmail.isBlank() && !updatedEmail.equalsIgnoreCase(user.getEmail())) {
                Optional<ProfileEntity> existing = profileRepository.findByEmail(updatedEmail);
                if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                    return Map.of("error", "Email already in use");
                }
                user.setEmail(updatedEmail);
            }
        }

        ProfileEntity savedUser = profileRepository.save(user);

        Map<String, Object> userPayload = new LinkedHashMap<>();
        userPayload.put("id", savedUser.getId());
        userPayload.put("email", savedUser.getEmail());
        userPayload.put("fullName", savedUser.getFullName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("user", userPayload);
        return response;
    }
}
