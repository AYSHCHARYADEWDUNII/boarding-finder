package com.boardingfinder.api.room;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public RoomResponse create(CreateRoomRequest request) {
        Room room = new Room(
                request.title().trim(),
                request.description().trim(),
                request.monthlyPrice(),
                request.address().trim(),
                request.distanceToCampusKm(),
                request.imageUrl() == null || request.imageUrl().isBlank()
                        ? null
                        : request.imageUrl().trim(),
                request.ownerName().trim()
        );
        return RoomResponse.from(roomRepository.save(room));
    }
}
