package com.melliza.wildvault.Profile;

import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileDTO getProfileByUsername(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }

        Optional<ProfileEntity> profileOptional = profileRepository.findByUsername(username);
        return profileOptional.map(this::toDto).orElse(null);
    }

    private ProfileDTO toDto(ProfileEntity entity) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setUsername(entity.getUsername());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setFullName(buildFullName(entity));
        dto.setPhotoUrl(buildPhotoDataUrl(entity));
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private String buildFullName(ProfileEntity entity) {
        String firstName = entity.getFirstName() == null ? "" : entity.getFirstName().trim();
        String lastName = entity.getLastName() == null ? "" : entity.getLastName().trim();

        if (firstName.isBlank() && lastName.isBlank()) {
            return entity.getUsername();
        }

        if (firstName.isBlank()) {
            return lastName;
        }

        if (lastName.isBlank()) {
            return firstName;
        }

        return firstName + " " + lastName;
    }

    private String buildPhotoDataUrl(ProfileEntity entity) {
        byte[] photoData = entity.getPhotoData();
        if (photoData == null || photoData.length == 0) {
            return entity.getPhotoUrl();
        }

        String contentType = entity.getPhotoContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }

        String base64 = Base64.getEncoder().encodeToString(photoData);
        return "data:" + contentType + ";base64," + base64;
    }
}
