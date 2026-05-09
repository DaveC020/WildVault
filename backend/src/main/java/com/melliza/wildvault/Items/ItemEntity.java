package com.melliza.wildvault.Items;

import com.melliza.wildvault.Register.RegisterEntity;
import com.melliza.wildvault.Requests.BorrowRequestEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wildvault_item")
public class ItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private RegisterEntity owner;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description = "";

    @Column(length = 300)
    private String category = "";

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "uploaded_image_url", length = 1000)
    private String uploadedImageUrl;

    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    @Column(name = "image_content_type")
    private String imageContentType;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<BorrowRequestEntity> borrowRequests = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RegisterEntity getOwner() { return owner; }
    public void setOwner(RegisterEntity owner) { this.owner = owner; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getUploadedImageUrl() { return uploadedImageUrl; }
    public void setUploadedImageUrl(String uploadedImageUrl) { this.uploadedImageUrl = uploadedImageUrl; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getImageContentType() { return imageContentType; }
    public void setImageContentType(String imageContentType) { this.imageContentType = imageContentType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
