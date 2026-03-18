package com.melliza.wildvault.UploadProfilePhoto;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class UploadProfilePhotoService {

    private final ProfileRepository profileRepository;
    private final FileStorageService fileStorageService;

    public UploadProfilePhotoService(ProfileRepository profileRepository, FileStorageService fileStorageService) {
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
    }

    public UploadProfilePhotoDTO uploadProfilePhoto(String username, MultipartFile file) {
        if (username == null || username.isBlank()) {
            return new UploadProfilePhotoDTO("Invalid or missing token", null);
        }

        byte[] imageBytes = fileStorageService.extractAndValidateImageBytes(file);
        if (imageBytes == null) {
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
}
