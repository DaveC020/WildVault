package com.melliza.wildvault.Requests;

import com.melliza.wildvault.Items.ItemEntity;
import com.melliza.wildvault.Register.RegisterEntity;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public final class RequestSerialization {
    private RequestSerialization() {
    }

    public static Map<String, Object> serializeRequest(BorrowRequestEntity request, RegisterEntity viewer) {
        ItemEntity item = request.getItem();
        RegisterEntity borrower = request.getBorrower();

        Map<String, Object> itemPayload = new LinkedHashMap<>();
        itemPayload.put("id", item.getId());
        itemPayload.put("name", item.getName());
        itemPayload.put("image_url", buildImageSource(item));
        itemPayload.put("owner_id", item.getOwner() == null ? null : item.getOwner().getId());
        itemPayload.put("owner_name", buildFullName(item.getOwner()));

        Map<String, Object> borrowerPayload = new LinkedHashMap<>();
        borrowerPayload.put("id", borrower.getId());
        borrowerPayload.put("username", borrower.getUsername());
        borrowerPayload.put("email", borrower.getEmail());
        borrowerPayload.put("fullName", buildFullName(borrower));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", request.getId());
        result.put("status", request.getStatus());
        result.put("purpose", request.getPurpose());
        result.put("due_date", request.getDueDate() == null ? null : request.getDueDate().toString());
        result.put("request_date", request.getRequestDate() == null ? null : request.getRequestDate().toString());
        result.put("is_overdue", request.isOverdue());
        result.put("item", itemPayload);
        result.put("borrower", borrowerPayload);
        result.put("can_manage", viewer != null
                && item.getOwner() != null
                && Objects.equals(item.getOwner().getId(), viewer.getId())
                && "Pending".equals(request.getStatus()));
        result.put("can_return", viewer != null
                && borrower != null
                && Objects.equals(borrower.getId(), viewer.getId())
                && "Approved".equals(request.getStatus()));
        result.put("can_extend", viewer != null
                && borrower != null
                && Objects.equals(borrower.getId(), viewer.getId())
                && "Approved".equals(request.getStatus()));
        return result;
    }

    public static Map<String, Object> serializeRecord(RequestRecordEntity record) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", record.getId());
        result.put("action", record.getAction());
        result.put("note", record.getNote());
        result.put("performed_at", record.getPerformedAt() == null ? null : record.getPerformedAt().toString());
        result.put("performed_by", record.getPerformedBy() == null ? null : buildFullName(record.getPerformedBy()));
        result.put("item", record.getBorrowRequest() == null || record.getBorrowRequest().getItem() == null ? null : record.getBorrowRequest().getItem().getName());
        result.put("borrower", record.getBorrowRequest() == null || record.getBorrowRequest().getBorrower() == null ? null : buildFullName(record.getBorrowRequest().getBorrower()));
        return result;
    }

    private static String buildImageSource(ItemEntity item) {
        if (item == null) return "";
        byte[] imageData = item.getImageData();
        if (imageData != null && imageData.length > 0) {
            String type = item.getImageContentType() == null || item.getImageContentType().isBlank() ? "image/jpeg" : item.getImageContentType();
            return "data:" + type + ";base64," + Base64.getEncoder().encodeToString(imageData);
        }
        if (item.getUploadedImageUrl() != null && !item.getUploadedImageUrl().isBlank() && !item.getUploadedImageUrl().startsWith("database://")) {
            return item.getUploadedImageUrl();
        }
        return item.getImageUrl() == null ? "" : item.getImageUrl();
    }

    private static String buildFullName(RegisterEntity user) {
        if (user == null) return "Unknown";
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isBlank()) return fullName;
        if (user.getUsername() != null && !user.getUsername().isBlank()) return user.getUsername();
        return user.getEmail() == null ? "User" : user.getEmail();
    }
}
