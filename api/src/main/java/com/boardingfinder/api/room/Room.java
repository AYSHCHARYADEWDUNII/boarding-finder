package com.boardingfinder.api.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

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

    @Column(nullable = false, length = 120)
    private String ownerName;

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
            String ownerName
    ) {
        this.title = title;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.address = address;
        this.distanceToCampusKm = distanceToCampusKm;
        this.imageUrl = imageUrl;
        this.ownerName = ownerName;
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

    public String getOwnerName() {
        return ownerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
