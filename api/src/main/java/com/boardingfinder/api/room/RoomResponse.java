package com.boardingfinder.api.room;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record RoomResponse(
        Long id,
        String title,
        String description,
        BigDecimal monthlyPrice,
        String address,
        BigDecimal distanceToCampusKm,
        String imageUrl,
        List<String> imageUrls,
        String boardingFor,
        String contactPhone,
        String contactWhatsapp,
        String contactEmail,
        BigDecimal latitude,
        BigDecimal longitude,
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
                room.getImages().isEmpty() ? room.getImageUrl() : room.getImages().getFirst().getUrl(),
                room.getImages().isEmpty()
                        ? room.getImageUrl() == null ? List.of() : List.of(room.getImageUrl())
                        : room.getImages().stream().map(RoomImage::getUrl).toList(),
                room.getBoardingFor() == null
                        ? "UNSPECIFIED"
                        : room.getBoardingFor().name(),
                room.getContactPhone(),
                room.getContactWhatsapp(),
                room.getContactEmail(),
                room.getLatitude(),
                room.getLongitude(),
                room.getOwnerName(),
                room.getCreatedAt()
        );
    }
}
