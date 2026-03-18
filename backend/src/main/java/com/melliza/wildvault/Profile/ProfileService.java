package com.melliza.wildvault.Profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

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
        dto.setEmail(entity.getEmail());
        dto.setFullName(entity.getFullName());
        dto.setPhotoUrl(entity.getPhotoUrl());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
