package com.melliza.wildvault.EditProfile;

import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Map<String, Object> updateProfile(String username, EditProfileDTO request) {
        if (username == null || username.isBlank()) {
            return Map.of("authError", true);
        }

        if (request == null) {
            return Map.of("error", "Request body is required");
        }

        Optional<ProfileEntity> userOptional;
        try {
            userOptional = findByUsernameWithRetry(username);
        } catch (DataAccessException ex) {
            return Map.of("error", "Unable to load profile due to a database error");
        }

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

        if (request.getFirstName() != null && !request.getFirstName().trim().isBlank()) {
            String immutableFirstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
            if (!request.getFirstName().trim().equalsIgnoreCase(immutableFirstName)) {
                return Map.of("error", "First name cannot be changed");
            }
        }

        if (request.getLastName() != null && !request.getLastName().trim().isBlank()) {
            String immutableLastName = user.getLastName() == null ? "" : user.getLastName().trim();
            if (!request.getLastName().trim().equalsIgnoreCase(immutableLastName)) {
                return Map.of("error", "Last name cannot be changed");
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isBlank()) {
            String requestedEmail = request.getEmail().trim();
            String currentEmail = user.getEmail() == null ? "" : user.getEmail().trim();
            if (!requestedEmail.equalsIgnoreCase(currentEmail)) {
                try {
                    if (existsByEmailIgnoreCaseAndIdNotWithRetry(requestedEmail, user.getId())) {
                        return Map.of("error", "Email already exists");
                    }
                } catch (DataAccessException ex) {
                    return Map.of("error", "Unable to validate email due to a database error");
                }
                user.setEmail(requestedEmail);
            }
        }

        ProfileEntity savedUser;
        try {
            savedUser = saveWithRetry(user);
        } catch (DataIntegrityViolationException ex) {
            return Map.of("error", "Email already exists");
        } catch (DataAccessException ex) {
            return Map.of("error", "Unable to update profile due to a database error");
        }

        Map<String, Object> userPayload = new LinkedHashMap<>();
        userPayload.put("id", savedUser.getId());
        userPayload.put("studentId", savedUser.getStudentId());
        userPayload.put("username", savedUser.getUsername());
        userPayload.put("firstName", savedUser.getFirstName());
        userPayload.put("lastName", savedUser.getLastName());
        userPayload.put("fullName", buildFullName(savedUser));
        userPayload.put("email", savedUser.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("user", userPayload);
        return response;
    }

    private Optional<ProfileEntity> findByUsernameWithRetry(String username) {
        try {
            return profileRepository.findByUsername(username);
        } catch (DataAccessException firstAttemptException) {
            return profileRepository.findByUsername(username);
        }
    }

    private boolean existsByEmailIgnoreCaseAndIdNotWithRetry(String email, Long id) {
        try {
            return profileRepository.existsByEmailIgnoreCaseAndIdNot(email, id);
        } catch (DataAccessException firstAttemptException) {
            return profileRepository.existsByEmailIgnoreCaseAndIdNot(email, id);
        }
    }

    private ProfileEntity saveWithRetry(ProfileEntity user) {
        try {
            return profileRepository.save(user);
        } catch (DataAccessException firstAttemptException) {
            return profileRepository.save(user);
        }
    }

    private String buildFullName(ProfileEntity user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();

        if (firstName.isBlank() && lastName.isBlank()) {
            return user.getUsername();
        }

        if (firstName.isBlank()) {
            return lastName;
        }

        if (lastName.isBlank()) {
            return firstName;
        }

        return firstName + " " + lastName;
    }
}
