package com.melliza.wildvault.Requests;

import com.melliza.wildvault.Register.RegisterEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wildvault_request_record")
public class RequestRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_request_id", nullable = false)
    private BorrowRequestEntity borrowRequest;

    @Column(nullable = false, length = 40)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id", nullable = false)
    private RegisterEntity performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String note = "";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BorrowRequestEntity getBorrowRequest() { return borrowRequest; }
    public void setBorrowRequest(BorrowRequestEntity borrowRequest) { this.borrowRequest = borrowRequest; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public RegisterEntity getPerformedBy() { return performedBy; }
    public void setPerformedBy(RegisterEntity performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
