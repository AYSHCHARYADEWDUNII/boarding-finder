package com.boardingfinder.api.room;

import com.boardingfinder.api.owner.OwnerAccount;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RoomServiceTest {

    @Test
    void distanceToCampusUsesConfiguredCoordinates() {
        RoomService service = new RoomService(mock(RoomRepository.class), 6.9022, 79.8612);

        assertEquals(new BigDecimal("1.11"), service.distanceToCampus(6.9122, 79.8612));
    }

    @Test
    void createAssociatesListingWithAuthenticatedOwner() {
        RoomRepository repository = mock(RoomRepository.class);
        OwnerAccount owner = new OwnerAccount("Room Owner", "owner@example.com", "hash");
        CreateRoomRequest request = new CreateRoomRequest(
                "  Room title ",
                " Description ",
                new BigDecimal("42000"),
                " Address ",
                null,
                null,
                BoardingGender.GIRLS,
                "0771234567",
                "0771234567",
                "owner@example.com",
                new BigDecimal("6.9022"),
                new BigDecimal("79.8612"),
                java.util.List.of("https://example.com/one.jpg", "https://example.com/two.jpg")
        );
        when(repository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomResponse response = new RoomService(repository, 6.9022, 79.8612).create(request, owner);

        assertEquals("Room title", response.title());
        assertEquals("Room Owner", response.ownerName());
        assertEquals("GIRLS", response.boardingFor());
        assertEquals(new BigDecimal("0.00"), response.distanceToCampusKm());
        assertEquals(java.util.List.of("https://example.com/one.jpg", "https://example.com/two.jpg"),
                response.imageUrls());
        assertEquals("0771234567", response.contactPhone());
        verify(repository).save(any(Room.class));
    }

    @Test
    void updateCannotAccessAnotherOwnersListing() {
        RoomRepository repository = mock(RoomRepository.class);
        OwnerAccount owner = new OwnerAccount("Room Owner", "owner@example.com", "hash");
        CreateRoomRequest request = new CreateRoomRequest(
                "Room title",
                "Description",
                new BigDecimal("42000"),
                "Address",
                null,
                null,
                BoardingGender.BOYS,
                null,
                null,
                null,
                new BigDecimal("6.90"),
                new BigDecimal("79.86"),
                java.util.List.of()
        );
        when(repository.findByIdAndOwnerAccount_Id(9L, owner.getId())).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> new RoomService(repository, 6.9022, 79.8612).update(9L, request, owner)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
