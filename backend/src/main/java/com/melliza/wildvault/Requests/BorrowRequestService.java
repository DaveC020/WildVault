package com.melliza.wildvault.Requests;

import com.melliza.wildvault.Items.ItemEntity;
import com.melliza.wildvault.Items.ItemRepository;
import com.melliza.wildvault.Register.RegisterEntity;
import com.melliza.wildvault.Register.RegisterRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

@Service
public class BorrowRequestService {
    private final BorrowRequestRepository borrowRequestRepository;
    private final RequestRecordRepository requestRecordRepository;
    private final ItemRepository itemRepository;
    private final RegisterRepository userRepository;

    public BorrowRequestService(
            BorrowRequestRepository borrowRequestRepository,
            RequestRecordRepository requestRecordRepository,
            ItemRepository itemRepository,
            RegisterRepository userRepository
    ) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.requestRecordRepository = requestRecordRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> create(Long itemId, Map<String, String> data, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        Optional<ItemEntity> found = itemRepository.findById(itemId);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Item not found."));
        }

        ItemEntity item = found.get();
        if (item.getOwner() != null && Objects.equals(item.getOwner().getId(), user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "You cannot borrow your own item."));
        }

        if (!item.isAvailable()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Item is not available."));
        }

        if (borrowRequestRepository.existsByItemAndBorrowerAndStatus(item, user, "Pending")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "You already have a pending request for this item."));
        }

        LocalDate dueDate;
        try {
            dueDate = parseDueDate(data == null ? null : data.get("due_date"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", ex.getMessage()));
        }

        BorrowRequestEntity request = new BorrowRequestEntity();
        request.setItem(item);
        request.setBorrower(user);
        request.setDueDate(dueDate);
        request.setPurpose(value(data, "purpose", value(data, "note", "")).trim());

        borrowRequestRepository.save(request);
        addRecord(request, "Submitted", user, request.getPurpose());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Borrow request submitted successfully.",
                "request", RequestSerialization.serializeRequest(request, user)
        ));
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> manage(Long requestId, String action, Map<String, String> data, String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        Optional<BorrowRequestEntity> found = borrowRequestRepository.findById(requestId);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Request not found."));
        }

        BorrowRequestEntity request = found.get();
        String normalizedAction = action == null ? "" : action.trim().toLowerCase();

        switch (normalizedAction) {
            case "approve" -> {
                ResponseEntity<Map<String, Object>> ownerCheck = requireOwner(user, request);
                if (ownerCheck != null) return ownerCheck;
                if (!"Pending".equals(request.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "This request has already been processed."));
                }
                request.setStatus("Approved");
                request.getItem().setAvailable(false);
                addRecord(request, "Approved", user, value(data, "reason", ""));
            }
            case "reject" -> {
                ResponseEntity<Map<String, Object>> ownerCheck = requireOwner(user, request);
                if (ownerCheck != null) return ownerCheck;
                if (!"Pending".equals(request.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "This request has already been processed."));
                }
                request.setStatus("Rejected");
                addRecord(request, "Rejected", user, value(data, "reason", ""));
            }
            case "return" -> {
                if (!isBorrower(user, request) && !isOwner(user, request)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Only the borrower or item owner can return this item."));
                }
                if (!"Approved".equals(request.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Only approved requests can be returned."));
                }
                request.setStatus("Returned");
                request.getItem().setAvailable(true);
                addRecord(request, "Returned", user, value(data, "note", ""));
            }
            case "extend" -> {
                if (!isBorrower(user, request)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Only the borrower can request an extension."));
                }
                if (!"Approved".equals(request.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Only approved requests can be extended."));
                }
                LocalDate newDueDate;
                try {
                    newDueDate = parseDueDate(data == null ? null : data.get("due_date"));
                } catch (IllegalArgumentException ex) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "error", ex.getMessage()));
                }
                request.setDueDate(newDueDate);
                addRecord(request, "Extended", user, value(data, "note", "Extended until " + newDueDate));
            }
            default -> {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid action."));
            }
        }

        itemRepository.save(request.getItem());
        borrowRequestRepository.save(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request " + request.getStatus().toLowerCase() + " successfully.",
                "request", RequestSerialization.serializeRequest(request, user)
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> history(String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        List<BorrowRequestEntity> incoming = borrowRequestRepository.findByItem_OwnerOrderByRequestDateDesc(user);
        List<BorrowRequestEntity> mine = borrowRequestRepository.findByBorrowerOrderByRequestDateDesc(user);
        List<Long> ids = Stream.concat(incoming.stream(), mine.stream()).map(BorrowRequestEntity::getId).distinct().toList();
        List<RequestRecordEntity> records = ids.isEmpty() ? List.of() : requestRecordRepository.findTop50ByBorrowRequest_IdInOrderByPerformedAtDesc(ids);

        return ResponseEntity.ok(Map.of(
                "incoming", incoming.stream().map(request -> RequestSerialization.serializeRequest(request, user)).toList(),
                "mine", mine.stream().map(request -> RequestSerialization.serializeRequest(request, user)).toList(),
                "records", records.stream().map(RequestSerialization::serializeRecord).toList()
        ));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> calendar(String username) {
        RegisterEntity user = currentUser(username);
        ResponseEntity<Map<String, Object>> denied = requireUser(user);
        if (denied != null) return denied;

        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(365);
        List<Map<String, Object>> events = new ArrayList<>();

        for (BorrowRequestEntity request : borrowRequestRepository.findByBorrowerAndStatusAndDueDateBetween(user, "Approved", today, limit)) {
            events.add(Map.of(
                    "id", "br-" + request.getId(),
                    "title", "Return: " + request.getItem().getName(),
                    "date", request.getDueDate().toString(),
                    "type", "borrower",
                    "request", RequestSerialization.serializeRequest(request, user)
            ));
        }

        for (BorrowRequestEntity request : borrowRequestRepository.findByItem_OwnerAndStatusAndDueDateBetween(user, "Approved", today, limit)) {
            events.add(Map.of(
                    "id", "ow-" + request.getId(),
                    "title", "Due back: " + request.getItem().getName() + " (" + buildFullName(request.getBorrower()) + ")",
                    "date", request.getDueDate().toString(),
                    "type", "owner",
                    "request", RequestSerialization.serializeRequest(request, user)
            ));
        }

        events.sort(Comparator.comparing(event -> event.get("date").toString()));
        return ResponseEntity.ok(Map.of("events", events));
    }

    private void addRecord(BorrowRequestEntity request, String action, RegisterEntity user, String note) {
        RequestRecordEntity record = new RequestRecordEntity();
        record.setBorrowRequest(request);
        record.setAction(action);
        record.setPerformedBy(user);
        record.setNote(note == null ? "" : note.trim());
        requestRecordRepository.save(record);
    }

    private LocalDate parseDueDate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Due date is required.");
        }

        LocalDate dueDate;
        try {
            dueDate = LocalDate.parse(value);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Due date must use YYYY-MM-DD format.");
        }

        if (dueDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Due date cannot be in the past.");
        }
        return dueDate;
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

    private ResponseEntity<Map<String, Object>> requireOwner(RegisterEntity user, BorrowRequestEntity request) {
        if (!isOwner(user, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Only the item owner can manage this request."));
        }
        return null;
    }

    private boolean isOwner(RegisterEntity user, BorrowRequestEntity request) {
        return user != null
                && request.getItem() != null
                && request.getItem().getOwner() != null
                && Objects.equals(request.getItem().getOwner().getId(), user.getId());
    }

    private boolean isBorrower(RegisterEntity user, BorrowRequestEntity request) {
        return user != null
                && request.getBorrower() != null
                && Objects.equals(request.getBorrower().getId(), user.getId());
    }

    private String value(Map<String, String> data, String key, String fallback) {
        if (data == null || data.get(key) == null) return fallback == null ? "" : fallback;
        return data.get(key);
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
