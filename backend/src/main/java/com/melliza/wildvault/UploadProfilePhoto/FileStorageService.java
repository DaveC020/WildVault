package com.melliza.wildvault.UploadProfilePhoto;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

@Service
public class FileStorageService {

    private static final byte[] EMPTY_BYTES = new byte[0];

    public byte[] extractAndValidateImageBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return EMPTY_BYTES;
        }

        String originalFilename = file.getOriginalFilename();
        String lowerFilename = originalFilename == null ? "" : originalFilename.toLowerCase(Locale.ROOT);
        boolean validExtension = lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg") || lowerFilename.endsWith(".png");

        String contentType = file.getContentType();
        boolean validContentType = "image/jpeg".equalsIgnoreCase(contentType) || "image/png".equalsIgnoreCase(contentType);

        if (!validExtension || !validContentType) {
            return EMPTY_BYTES;
        }

        try {
            return file.getBytes();
        } catch (IOException e) {
            return EMPTY_BYTES;
        }
    }

    public String buildFileReference(Long userId) {
        return "/users/profile/photo/" + userId;
    }
}
