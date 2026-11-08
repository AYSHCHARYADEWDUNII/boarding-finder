package com.boardingfinder.api.room;

import com.boardingfinder.api.owner.OwnerAccount;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final double campusLatitude;
    private final double campusLongitude;

    public RoomService(
            RoomRepository roomRepository,
            @Value("${app.campus.latitude:6.9022}") double campusLatitude,
            @Value("${app.campus.longitude:79.8612}") double campusLongitude
    ) {
        this.roomRepository = roomRepository;
        this.campusLatitude = campusLatitude;
        this.campusLongitude = campusLongitude;
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
        List<String> imageUrls = request.effectiveImageUrls();
        Room room = new Room(
                request.title().trim(),
                request.description().trim(),
                request.monthlyPrice(),
                request.address().trim(),
                distanceToCampus(request.latitude().doubleValue(), request.longitude().doubleValue()),
                imageUrls.isEmpty() ? null : imageUrls.getFirst().trim(),
                request.boardingFor(),
                owner.getName(),
                owner,
                trimToNull(request.contactPhone()),
                trimToNull(request.contactWhatsapp()),
                trimToNull(request.contactEmail()),
                request.latitude(),
                request.longitude()
        );
        room.setImages(imageUrls);
        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse update(Long id, CreateRoomRequest request, OwnerAccount owner) {
        Room room = ownedRoom(id, owner.getId());
        List<String> imageUrls = request.effectiveImageUrls();
        room.update(
                request.title().trim(),
                request.description().trim(),
                request.monthlyPrice(),
                request.address().trim(),
                distanceToCampus(request.latitude().doubleValue(), request.longitude().doubleValue()),
                imageUrls.isEmpty() ? null : imageUrls.getFirst().trim(),
                request.boardingFor(),
                trimToNull(request.contactPhone()),
                trimToNull(request.contactWhatsapp()),
                trimToNull(request.contactEmail()),
                request.latitude(),
                request.longitude(),
                imageUrls
        );
        return RoomResponse.from(room);
    }

    public BigDecimal distanceToCampus(double latitude, double longitude) {
        double earthRadiusKm = 6371.0;
        double latitudeDelta = Math.toRadians(latitude - campusLatitude);
        double longitudeDelta = Math.toRadians(longitude - campusLongitude);
        double haversine = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2)
                + Math.cos(Math.toRadians(campusLatitude))
                * Math.cos(Math.toRadians(latitude))
                * Math.sin(longitudeDelta / 2)
                * Math.sin(longitudeDelta / 2);
        double distance = 2 * earthRadiusKm * Math.atan2(
                Math.sqrt(haversine),
                Math.sqrt(1 - haversine)
        );
        return BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void delete(Long id, OwnerAccount owner) {
        roomRepository.delete(ownedRoom(id, owner.getId()));
    }

    private Room ownedRoom(Long id, Long ownerId) {
        return roomRepository.findByIdAndOwnerAccount_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
