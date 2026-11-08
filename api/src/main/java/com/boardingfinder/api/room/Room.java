package com.boardingfinder.api.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.boardingfinder.api.owner.OwnerAccount;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 3000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal distanceToCampusKm;

    @Column(length = 2048)
    private String imageUrl;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private BoardingGender boardingFor;

    @Column(length = 40)
    private String contactPhone;

    @Column(length = 40)
    private String contactWhatsapp;

    @Column(length = 254)
    private String contactEmail;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "room", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<RoomImage> images = new ArrayList<>();

    @Column(nullable = false, length = 120)
    private String ownerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_account_id")
    private OwnerAccount ownerAccount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Room() {
    }

    public Room(
            String title,
            String description,
            BigDecimal monthlyPrice,
            String address,
            BigDecimal distanceToCampusKm,
            String imageUrl,
            BoardingGender boardingFor,
            String ownerName,
            OwnerAccount ownerAccount
    ) {
        this(title, description, monthlyPrice, address, distanceToCampusKm, imageUrl, boardingFor,
                ownerName, ownerAccount, null, null, null, null, null);
    }

    public Room(
            String title,
            String description,
            BigDecimal monthlyPrice,
            String address,
            BigDecimal distanceToCampusKm,
            String imageUrl,
            BoardingGender boardingFor,
            String ownerName,
            OwnerAccount ownerAccount,
            String contactPhone,
            String contactWhatsapp,
            String contactEmail,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        this.title = title;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.address = address;
        this.distanceToCampusKm = distanceToCampusKm;
        this.imageUrl = imageUrl;
        this.boardingFor = boardingFor;
        this.ownerName = ownerName;
        this.ownerAccount = ownerAccount;
        this.contactPhone = contactPhone;
        this.contactWhatsapp = contactWhatsapp;
        this.contactEmail = contactEmail;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void update(
            String title,
            String description,
            BigDecimal monthlyPrice,
            String address,
            BigDecimal distanceToCampusKm,
            String imageUrl,
            BoardingGender boardingFor,
            String contactPhone,
            String contactWhatsapp,
            String contactEmail,
            BigDecimal latitude,
            BigDecimal longitude,
            List<String> imageUrls
    ) {
        this.title = title;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.address = address;
        this.distanceToCampusKm = distanceToCampusKm;
        this.imageUrl = imageUrl;
        this.boardingFor = boardingFor;
        this.contactPhone = contactPhone;
        this.contactWhatsapp = contactWhatsapp;
        this.contactEmail = contactEmail;
        this.latitude = latitude;
        this.longitude = longitude;
        setImages(imageUrls);
    }

    public void setImages(List<String> imageUrls) {
        images.clear();
        if (imageUrls == null) {
            imageUrl = null;
            return;
        }
        for (int index = 0; index < imageUrls.size(); index++) {
            String url = imageUrls.get(index);
            if (url != null && !url.isBlank()) {
                images.add(new RoomImage(url.trim(), index, this));
            }
        }
        imageUrl = images.isEmpty() ? null : images.getFirst().getUrl();
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public String getAddress() {
        return address;
    }

    public BigDecimal getDistanceToCampusKm() {
        return distanceToCampusKm;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BoardingGender getBoardingFor() {
        return boardingFor;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getContactWhatsapp() {
        return contactWhatsapp;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public List<RoomImage> getImages() {
        return images.stream().sorted(Comparator.comparingInt(RoomImage::getSortOrder)).toList();
    }

    public String getOwnerName() {
        return ownerName;
    }

    public OwnerAccount getOwnerAccount() {
        return ownerAccount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
