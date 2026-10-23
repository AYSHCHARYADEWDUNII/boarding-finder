package com.boardingfinder.api.room;

import com.boardingfinder.api.owner.OwnerAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomResponse> findAll() {
        return roomRepository.findAll()
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    public RoomResponse findById(Long id) {
        return roomRepository.findById(id)
                .map(RoomResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    public List<RoomResponse> findForOwner(Long ownerId) {
        return roomRepository.findAllByOwnerAccount_IdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    @Transactional
    public RoomResponse create(CreateRoomRequest request, OwnerAccount owner) {
        Room room = new Room(
                request.title().trim(),
                request.description().trim(),
                request.monthlyPrice(),
                request.address().trim(),
                request.distanceToCampusKm(),
                request.imageUrl() == null || request.imageUrl().isBlank()
                        ? null
                        : request.imageUrl().trim(),
                request.boardingGender(),
                owner.getName(),
                owner
        );
        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse update(Long id, CreateRoomRequest request, OwnerAccount owner) {
        Room room = ownedRoom(id, owner.getId());
        room.update(
                request.title().trim(),
                request.description().trim(),
                request.monthlyPrice(),
                request.address().trim(),
                request.distanceToCampusKm(),
                request.imageUrl() == null || request.imageUrl().isBlank()
                        ? null
                        : request.imageUrl().trim(),
                request.boardingGender()
        );
        return RoomResponse.from(room);
    }

    @Transactional
    public void delete(Long id, OwnerAccount owner) {
        roomRepository.delete(ownedRoom(id, owner.getId()));
    }

    private Room ownedRoom(Long id, Long ownerId) {
        return roomRepository.findByIdAndOwnerAccount_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }
}
