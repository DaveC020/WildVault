package com.melliza.wildvault.Requests;

import com.melliza.wildvault.Items.ItemEntity;
import com.melliza.wildvault.Register.RegisterEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wildvault_borrow_request")
public class BorrowRequestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemEntity item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private RegisterEntity borrower;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate = LocalDateTime.now();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 30)
    private String status = "Pending";

    @Column(columnDefinition = "TEXT")
    private String purpose = "";

    @OneToMany(mappedBy = "borrowRequest", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<RequestRecordEntity> records = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItemEntity getItem() { return item; }
    public void setItem(ItemEntity item) { this.item = item; }

    public RegisterEntity getBorrower() { return borrower; }
    public void setBorrower(RegisterEntity borrower) { this.borrower = borrower; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public boolean isOverdue() {
        return dueDate != null && "Approved".equals(status) && LocalDate.now().isAfter(dueDate);
    }
}
