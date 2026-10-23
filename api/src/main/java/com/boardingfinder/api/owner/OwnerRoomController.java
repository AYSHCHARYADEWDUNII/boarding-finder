package com.boardingfinder.api.owner;

import com.boardingfinder.api.room.CreateRoomRequest;
import com.boardingfinder.api.room.RoomResponse;
import com.boardingfinder.api.room.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/owner/rooms")
@CrossOrigin(
        origins = "${app.cors.allowed-origin:http://localhost:3000}",
        allowCredentials = "true"
)
public class OwnerRoomController {

    private final RoomService roomService;

    public OwnerRoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<RoomResponse> findMine(@AuthenticationPrincipal OwnerAccount owner) {
        return roomService.findForOwner(owner.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal OwnerAccount owner
    ) {
        return roomService.create(request, owner);
    }

    @PutMapping("/{id}")
    public RoomResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal OwnerAccount owner
    ) {
        return roomService.update(id, request, owner);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerAccount owner
    ) {
        roomService.delete(id, owner);
    }
}
