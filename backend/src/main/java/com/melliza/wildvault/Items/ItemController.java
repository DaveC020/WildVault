package com.melliza.wildvault.Items;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping({ "/dashboard", "/dashboard/" })
    public ResponseEntity<Map<String, Object>> dashboard(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return itemService.dashboard(search, category, status, page, size, authName(authentication));
    }

    @GetMapping({ "", "/" })
    public ResponseEntity<Map<String, Object>> all(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return itemService.collectionGet(search, category, status, page, size, authName(authentication));
    }

    @PostMapping(value = { "", "/" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> create(
            @RequestParam Map<String, String> data,
            @RequestParam(value = "category", required = false) List<String> categories,
            @RequestPart(value = "image_file", required = false) MultipartFile imageFile,
            Authentication authentication) throws IOException {
        return itemService.create(data, categories, imageFile, authName(authentication));
    }

    @GetMapping({ "/mine", "/mine/" })
    public ResponseEntity<Map<String, Object>> mine(Authentication authentication) {
        return itemService.mine(authName(authentication));
    }

    @GetMapping({ "/{id}", "/{id}/" })
    public ResponseEntity<Map<String, Object>> detail(@PathVariable Long id, Authentication authentication) {
        return itemService.detail(id, authName(authentication));
    }

    @PutMapping(value = { "/{id}", "/{id}/" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updatePut(
            @PathVariable Long id,
            @RequestParam Map<String, String> data,
            @RequestParam(value = "category", required = false) List<String> categories,
            @RequestPart(value = "image_file", required = false) MultipartFile imageFile,
            Authentication authentication) throws IOException {
        return itemService.update(id, data, categories, imageFile, authName(authentication));
    }

    @PostMapping(value = { "/{id}", "/{id}/" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updatePost(
            @PathVariable Long id,
            @RequestParam Map<String, String> data,
            @RequestParam(value = "category", required = false) List<String> categories,
            @RequestPart(value = "image_file", required = false) MultipartFile imageFile,
            Authentication authentication) throws IOException {
        return itemService.update(id, data, categories, imageFile, authName(authentication));
    }

    @GetMapping({ "/{id}/image", "/{id}/image/" })
    public ResponseEntity<byte[]> getItemImage(@PathVariable Long id) {
        return itemService.getItemImage(id);
    }

    @DeleteMapping({ "/{id}", "/{id}/" })
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Authentication authentication) {
        return itemService.delete(id, authName(authentication));
    }

    private String authName(Authentication authentication) {
        return authentication == null ? null : authentication.getName();
    }
}
