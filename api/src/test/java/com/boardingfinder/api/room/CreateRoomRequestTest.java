package com.boardingfinder.api.room;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreateRoomRequestTest {

    @Test
    void boardingMustBeForBoysOrGirls() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();

            assertTrue(validator.validate(request(BoardingGender.BOYS)).isEmpty());
            assertTrue(validator.validate(request(BoardingGender.GIRLS)).isEmpty());
            var violations = validator.validate(request(BoardingGender.ANY));

            assertEquals(1, violations.size());
            assertEquals("Boarding must be for boys or girls.", violations.iterator().next().getMessage());
        }
    }

    private CreateRoomRequest request(BoardingGender boardingGender) {
        return new CreateRoomRequest(
                "Room",
                "Description",
                new BigDecimal("42000"),
                "Address",
                null,
                null,
                boardingGender,
                null,
                null,
                null,
                new BigDecimal("6.9"),
                new BigDecimal("79.8"),
                List.of("https://example.com/room.jpg")
        );
    }
}
