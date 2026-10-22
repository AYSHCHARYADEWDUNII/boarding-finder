package com.boardingfinder.api.room;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateRoomRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 3000) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monthlyPrice,
        @NotBlank @Size(max = 255) String address,
        @NotNull @DecimalMin(value = "0.00") BigDecimal distanceToCampusKm,
        @Size(max = 2048) String imageUrl,
        @NotBlank @Size(max = 120) String ownerName
) {
}
