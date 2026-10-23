package com.boardingfinder.api.room;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findAllByOwnerAccount_IdOrderByCreatedAtDesc(Long ownerId);

    Optional<Room> findByIdAndOwnerAccount_Id(Long id, Long ownerId);
}
