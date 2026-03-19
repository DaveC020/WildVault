package com.melliza.wildvault.UploadProfilePhoto;

public class UploadProfilePhotoDTO {

    private String message;
    private String fileUrl;
    private String fileReference;

    public UploadProfilePhotoDTO() {
    }

    public UploadProfilePhotoDTO(String message, String fileUrl) {
        this.message = message;
        this.fileUrl = fileUrl;
    }

    public UploadProfilePhotoDTO(String message, String fileUrl, String fileReference) {
        this.message = message;
        this.fileUrl = fileUrl;
        this.fileReference = fileReference;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileReference() {
        return fileReference;
    }

    public void setFileReference(String fileReference) {
        this.fileReference = fileReference;
    }
}
