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
    void createAssociatesListingWithAuthenticatedOwner() {
        RoomRepository repository = mock(RoomRepository.class);
        OwnerAccount owner = new OwnerAccount("Room Owner", "owner@example.com", "hash");
        CreateRoomRequest request = new CreateRoomRequest(
                "  Room title ",
                " Description ",
                new BigDecimal("42000"),
                " Address ",
                new BigDecimal("1.2"),
                null,
                BoardingGender.GIRLS
        );
        when(repository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomResponse response = new RoomService(repository).create(request, owner);

        assertEquals("Room title", response.title());
        assertEquals("Room Owner", response.ownerName());
        assertEquals("GIRLS", response.boardingGender());
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
                new BigDecimal("1.2"),
                null,
                BoardingGender.BOYS
        );
        when(repository.findByIdAndOwnerAccount_Id(9L, owner.getId())).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> new RoomService(repository).update(9L, request, owner)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
