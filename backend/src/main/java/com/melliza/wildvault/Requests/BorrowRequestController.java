package com.melliza.wildvault.Requests;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class BorrowRequestController {
    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @PostMapping({"/create/{itemId}", "/create/{itemId}/"})
    public ResponseEntity<Map<String, Object>> create(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> data,
            Authentication authentication
    ) {
        return borrowRequestService.create(itemId, data, authName(authentication));
    }

    @PostMapping({"/manage/{requestId}/{action}", "/manage/{requestId}/{action}/"})
    public ResponseEntity<Map<String, Object>> manage(
            @PathVariable Long requestId,
            @PathVariable String action,
            @RequestBody(required = false) Map<String, String> data,
            Authentication authentication
    ) {
        return borrowRequestService.manage(requestId, action, data, authName(authentication));
    }

    @GetMapping({"/history", "/history/"})
    public ResponseEntity<Map<String, Object>> history(Authentication authentication) {
        return borrowRequestService.history(authName(authentication));
    }

    @GetMapping({"/calendar", "/calendar/"})
    public ResponseEntity<Map<String, Object>> calendar(Authentication authentication) {
        return borrowRequestService.calendar(authName(authentication));
    }

    private String authName(Authentication authentication) {
        return authentication == null ? null : authentication.getName();
    }
}
