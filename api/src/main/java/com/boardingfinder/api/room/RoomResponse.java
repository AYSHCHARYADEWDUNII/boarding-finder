package com.boardingfinder.api.room;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RoomResponse(
        Long id,
        String title,
        String description,
        BigDecimal monthlyPrice,
        String address,
        BigDecimal distanceToCampusKm,
        String imageUrl,
        String ownerName,
        LocalDateTime createdAt
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getTitle(),
                room.getDescription(),
                room.getMonthlyPrice(),
                room.getAddress(),
                room.getDistanceToCampusKm(),
                room.getImageUrl(),
                room.getOwnerName(),
                room.getCreatedAt()
        );
    }
}
