package com.melliza.wildvault.Items;

import com.melliza.wildvault.Register.RegisterEntity;
import com.melliza.wildvault.Register.RegisterRepository;
import com.melliza.wildvault.Requests.BorrowRequestRepository;
import com.melliza.wildvault.Requests.RequestSerialization;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemService {
    public static final List<String> CATEGORY_CHOICES = List.of(
            "Books", "Electronics", "Tools", "Sports", "School Supplies", "Board Games",
            "Sports Equipment", "Toys & Games", "Furniture", "Kitchen Appliances",
            "Cleaning Equipment", "Calculators", "Architecture", "Athletics", "Wellness",
            "Miscellaneous / Others"
    );

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");

    private final ItemRepository itemRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final RegisterRepository userRepository;

    public ItemService(
            ItemRepository itemRepository,
            BorrowRequestRepository borrowRequestRepository,
            RegisterRepository userRepository
    ) {
        this.itemRepository = itemRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> dashboard(String search, String category, String status, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        List<ItemEntity> filtered = filter(search, category, status);
        return ResponseEntity.ok(Map.of(
                "user", serializeUser(user),
                "items", filtered.stream().map(item -> serializeItem(item, user)).toList(),
                "categories", CATEGORY_CHOICES,
                "stats", Map.of(
                        "total_items", itemRepository.count(),
                        "available_items", itemRepository.countByAvailable(true),
                        "borrowed_items", itemRepository.countByAvailable(false),
                        "overdue_items", borrowRequestRepository.countByStatusAndDueDateBefore("Approved", LocalDate.now())
                ),
                "incoming_requests", borrowRequestRepository
                        .findByItem_OwnerAndStatusOrderByRequestDateDesc(user, "Pending")
                        .stream()
                        .map(request -> RequestSerialization.serializeRequest(request, user))
                        .toList()
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> collectionGet(String search, String category, String status, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        return ResponseEntity.ok(Map.of(
                "items", filter(search, category, status).stream().map(item -> serializeItem(item, user)).toList(),
                "categories", CATEGORY_CHOICES
        ));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> create(Map<String, String> data, List<String> categories, MultipartFile imageFile, String username) throws IOException {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        ItemEntity item = new ItemEntity();
        item.setOwner(user);
        String validationError = saveFromForm(item, data, categories, imageFile, true);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", validationError));
        }

        itemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Item added successfully.",
                "item", serializeItem(item, user)
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> mine(String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        return ResponseEntity.ok(Map.of(
                "items", itemRepository.findByOwnerOrderByCreatedAtDesc(user).stream().map(item -> serializeItem(item, user)).toList(),
                "categories", CATEGORY_CHOICES
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> detail(Long id, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        Optional<ItemEntity> item = itemRepository.findById(id);
        if (item.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Item not found."));
        }
        return ResponseEntity.ok(Map.of("item", serializeItem(item.get(), user)));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> update(Long id, Map<String, String> data, List<String> categories, MultipartFile imageFile, String username) throws IOException {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        Optional<ItemEntity> found = itemRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Item not found."));
        }

        ItemEntity item = found.get();
        if (!Objects.equals(item.getOwner().getId(), user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "You cannot modify another user's item."));
        }

        String validationError = saveFromForm(item, data, categories, imageFile, false);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", validationError));
        }

        itemRepository.save(item);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Item updated successfully.",
                "item", serializeItem(item, user)
        ));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> delete(Long id, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        Optional<ItemEntity> found = itemRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Item not found."));
        }

        ItemEntity item = found.get();
        if (!Objects.equals(item.getOwner().getId(), user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "You cannot modify another user's item."));
        }

        itemRepository.delete(item);
        return ResponseEntity.ok(Map.of("success", true, "message", "Item deleted successfully."));
    }

    public Map<String, Object> serializeItem(ItemEntity item, RegisterEntity viewer) {
        String image = buildImageSource(item);
        List<String> categories = Arrays.stream((item.getCategory() == null ? "" : item.getCategory()).split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", item.getId());
        result.put("name", item.getName());
        result.put("description", item.getDescription());
        result.put("category", item.getCategory());
        result.put("categories", categories);
        result.put("image_url", image);
        result.put("imageUrl", image);
        result.put("quantity", item.getQuantity());
        result.put("is_available", item.isAvailable());
        result.put("status", item.isAvailable() ? "available" : "borrowed");
        result.put("created_at", item.getCreatedAt() == null ? null : item.getCreatedAt().toString());
        result.put("phone_number", isBlank(item.getPhoneNumber()) ? "Not provided" : item.getPhoneNumber());
        result.put("owner", serializeUser(item.getOwner()));
        result.put("owner_name", buildFullName(item.getOwner()));
        result.put("is_owner", viewer != null && item.getOwner() != null && Objects.equals(item.getOwner().getId(), viewer.getId()));
        return result;
    }

    public Map<String, Object> serializeUser(RegisterEntity user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("studentId", user.getStudentId());
        result.put("firstName", user.getFirstName());
        result.put("lastName", user.getLastName());
        result.put("fullName", buildFullName(user));
        return result;
    }

    private List<ItemEntity> filter(String search, String category, String status) {
        String query = search == null ? "" : search.trim().toLowerCase();
        String categoryFilter = category == null ? "" : category.trim().toLowerCase();
        String statusFilter = status == null ? "" : status.trim().toLowerCase();

        return itemRepository.findAll().stream()
                .sorted(Comparator.comparing(ItemEntity::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .filter(item -> query.isBlank()
                        || contains(item.getName(), query)
                        || contains(item.getDescription(), query)
                        || contains(item.getCategory(), query)
                        || contains(buildFullName(item.getOwner()), query))
                .filter(item -> categoryFilter.isBlank()
                        || "all categories".equals(categoryFilter)
                        || contains(item.getCategory(), categoryFilter))
                .filter(item -> statusFilter.isBlank()
                        || "all".equals(statusFilter)
                        || ("available".equals(statusFilter) && item.isAvailable())
                        || ("borrowed".equals(statusFilter) && !item.isAvailable()))
                .collect(Collectors.toList());
    }

    private String saveFromForm(ItemEntity item, Map<String, String> data, List<String> categories, MultipartFile imageFile, boolean isCreate) throws IOException {
        String name = value(data, "name", item.getName()).trim();
        if (name.isBlank()) return "Item name is required.";
        if (name.length() > 120) return "Item name must not exceed 120 characters.";
        item.setName(name);

        item.setDescription(value(data, "description", item.getDescription()).trim());

        if (categories != null && !categories.isEmpty()) {
            String joined = categories.stream()
                    .filter(value -> value != null && !value.isBlank())
                    .map(String::trim)
                    .collect(Collectors.joining(", "));
            item.setCategory(joined);
        } else if (data != null && data.containsKey("category")) {
            item.setCategory(value(data, "category", item.getCategory()).trim());
        }

        try {
            int quantity = Integer.parseInt(value(data, "quantity", String.valueOf(item.getQuantity())));
            item.setQuantity(Math.max(1, quantity));
        } catch (NumberFormatException ignored) {
            item.setQuantity(1);
        }

        if (isCreate && (data == null || !data.containsKey("is_available"))) {
            item.setAvailable(true);
        } else if (data != null && data.containsKey("is_available")) {
            item.setAvailable(parseBoolean(data.get("is_available")));
        }

        item.setPhoneNumber(value(data, "phone_number", value(data, "contact_phone", item.getPhoneNumber())).trim());

        String imageUrl = value(data, "image_url", item.getImageUrl()).trim();
        if (!imageUrl.isBlank()) {
            item.setImageUrl(imageUrl);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String type = imageFile.getContentType() == null ? "" : imageFile.getContentType().toLowerCase();
            if (!ALLOWED_IMAGE_TYPES.contains(type)) {
                return "Invalid image type. Only JPG and PNG files are allowed.";
            }
            item.setImageData(imageFile.getBytes());
            item.setImageContentType(type);
            item.setUploadedImageUrl("database://wildvault_item/" + UUID.randomUUID());
        }

        return null;
    }

    private RegisterEntity currentUser(String username) {
        if (username == null || username.isBlank()) return null;
        return userRepository.findByUsername(username).orElse(null);
    }

    private ResponseEntity<Map<String, Object>> requireUser(RegisterEntity user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Login required."));
        }
        return null;
    }

    private boolean parseBoolean(String value) {
        if (value == null) return false;
        return List.of("true", "1", "on", "yes", "available").contains(value.trim().toLowerCase());
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isBlank();
    }

    private String value(Map<String, String> data, String key, String fallback) {
        if (data == null || !data.containsKey(key) || data.get(key) == null) {
            return fallback == null ? "" : fallback;
        }
        return data.get(key);
    }

    private String buildImageSource(ItemEntity item) {
        byte[] imageData = item.getImageData();
        if (imageData != null && imageData.length > 0) {
            return "/api/items/" + item.getId() + "/image";
        }

        if (!isBlank(item.getUploadedImageUrl()) && !item.getUploadedImageUrl().startsWith("database://")) {
            return item.getUploadedImageUrl();
        }

        return item.getImageUrl();
    }

    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getItemImage(Long id) {
        Optional<ItemEntity> found = itemRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ItemEntity item = found.get();
        byte[] imageData = item.getImageData();
        if (imageData == null || imageData.length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = isBlank(item.getImageContentType()) ? MediaType.IMAGE_JPEG_VALUE : item.getImageContentType();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(imageData);
    }

    private String buildFullName(RegisterEntity user) {
        if (user == null) return "Unknown";
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isBlank()) return fullName;
        if (user.getUsername() != null && !user.getUsername().isBlank()) return user.getUsername();
        return user.getEmail() == null ? "User" : user.getEmail();
    }
}
