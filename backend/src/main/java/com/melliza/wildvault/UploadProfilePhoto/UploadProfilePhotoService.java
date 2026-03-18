package com.melliza.wildvault.UploadProfilePhoto;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.melliza.wildvault.Profile.ProfileEntity;
import java.util.Base64;
import java.util.Optional;

@Service
public class UploadProfilePhotoService {

    private final UploadProfilePhotoRepository profileRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileStorageService fileStorageService;

    public UploadProfilePhotoService(
            UploadProfilePhotoRepository profileRepository,
            UserProfileRepository userProfileRepository,
            FileStorageService fileStorageService
    ) {
        this.profileRepository = profileRepository;
        this.userProfileRepository = userProfileRepository;
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

        String fileReference = fileStorageService.buildFileReference(profile.getId());
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }

        UserProfileEntity userProfile = userProfileRepository.findByUsername(username).orElseGet(UserProfileEntity::new);
        userProfile.setUsername(username);
        userProfile.setEmail(profile.getEmail());
        userProfile.setPhotoData(imageBytes);
        userProfile.setPhotoContentType(contentType);
        userProfile.setPhotoUrl(fileReference);
        userProfileRepository.save(userProfile);

        return new UploadProfilePhotoDTO("Profile photo uploaded successfully", buildPhotoDataUrl(imageBytes, contentType));
    }

    public Optional<UserProfileEntity> getProfilePhotoByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        return userProfileRepository.findByUsername(username)
                .filter(profile -> profile.getPhotoData() != null && profile.getPhotoData().length > 0);
    }

    private String buildPhotoDataUrl(byte[] bytes, String contentType) {
        return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }
}
