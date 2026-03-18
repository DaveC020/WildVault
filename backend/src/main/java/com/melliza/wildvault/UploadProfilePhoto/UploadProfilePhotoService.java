package com.melliza.wildvault.UploadProfilePhoto;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.melliza.wildvault.Profile.ProfileEntity;
import java.util.Optional;

@Service
public class UploadProfilePhotoService {

    private final UploadProfilePhotoRepository profileRepository;
    private final FileStorageService fileStorageService;

    public UploadProfilePhotoService(UploadProfilePhotoRepository profileRepository, FileStorageService fileStorageService) {
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
    }

    public UploadProfilePhotoDTO uploadProfilePhoto(String username, MultipartFile file) {
        if (username == null || username.isBlank()) {
            return new UploadProfilePhotoDTO("Invalid or missing token", null);
        }

        byte[] imageBytes = fileStorageService.extractAndValidateImageBytes(file);
        if (imageBytes.length == 0) {
            return new UploadProfilePhotoDTO("Invalid file. Only .jpg and .png are allowed", null);
        }

        Optional<ProfileEntity> profileOptional = profileRepository.findByUsername(username);
        if (profileOptional.isEmpty()) {
            return new UploadProfilePhotoDTO("User profile not found", null);
        }

        ProfileEntity profile = profileOptional.get();
        profile.setPhotoData(imageBytes);
        profile.setPhotoContentType(file.getContentType());

        String fileReference = fileStorageService.buildFileReference(profile.getId());
        profile.setPhotoUrl(fileReference);
        profileRepository.save(profile);

        return new UploadProfilePhotoDTO("Profile photo uploaded successfully", fileReference);
    }

    public Optional<ProfileEntity> getProfilePhotoByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        return profileRepository.findByUsername(username)
                .filter(profile -> profile.getPhotoData() != null && profile.getPhotoData().length > 0);
    }
}
