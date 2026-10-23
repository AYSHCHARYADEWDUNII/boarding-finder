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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.boardingfinder.api.owner.OwnerAccount;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private BoardingGender boardingGender;

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
            BoardingGender boardingGender,
            String ownerName,
            OwnerAccount ownerAccount
    ) {
        this.title = title;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.address = address;
        this.distanceToCampusKm = distanceToCampusKm;
        this.imageUrl = imageUrl;
        this.boardingGender = boardingGender;
        this.ownerName = ownerName;
        this.ownerAccount = ownerAccount;
    }

    public void update(
            String title,
            String description,
            BigDecimal monthlyPrice,
            String address,
            BigDecimal distanceToCampusKm,
            String imageUrl,
            BoardingGender boardingGender
    ) {
        this.title = title;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.address = address;
        this.distanceToCampusKm = distanceToCampusKm;
        this.imageUrl = imageUrl;
        this.boardingGender = boardingGender;
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

    public BoardingGender getBoardingGender() {
        return boardingGender;
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
