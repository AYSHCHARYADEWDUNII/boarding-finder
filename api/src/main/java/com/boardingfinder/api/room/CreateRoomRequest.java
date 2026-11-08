package com.boardingfinder.api.room;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record CreateRoomRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 3000) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monthlyPrice,
        @NotBlank @Size(max = 255) String address,
        @DecimalMin(value = "0.00") BigDecimal distanceToCampusKm,
        @Size(max = 2048) String imageUrl,
        @NotNull BoardingGender boardingFor,
        @Size(max = 40) String contactPhone,
        @Size(max = 40) String contactWhatsapp,
        @Email @Size(max = 254) String contactEmail,
        @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") BigDecimal latitude,
        @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") BigDecimal longitude,
        @Size(max = 10) List<@NotBlank @Size(max = 2048) String> imageUrls
) {
    @AssertTrue(message = "Boarding must be for boys or girls.")
    public boolean isBoardingForBoysOrGirls() {
        return boardingFor == BoardingGender.BOYS || boardingFor == BoardingGender.GIRLS;
    }

    public List<String> effectiveImageUrls() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls;
        }
        return imageUrl == null || imageUrl.isBlank() ? List.of() : List.of(imageUrl);
    }
}
