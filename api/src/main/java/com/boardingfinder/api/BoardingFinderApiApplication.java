package com.boardingfinder.api;

import com.boardingfinder.api.room.Room;
import com.boardingfinder.api.room.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class BoardingFinderApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardingFinderApiApplication.class, args);
    }

    @Bean
    CommandLineRunner seedRooms(RoomRepository roomRepository) {
        return args -> {
            if (roomRepository.count() > 0) {
                return;
            }

            roomRepository.saveAll(List.of(
                    new Room("A sunny room in a shared home", "A bright furnished room with a desk, wardrobe, and a quiet garden to unwind in.", new BigDecimal("42000"), "College Road, Colombo", new BigDecimal("0.8"), null, "Nimali Perera"),
                    new Room("A calm space for focused days", "Private room in a friendly home. Includes Wi-Fi, a shared kitchen, and laundry.", new BigDecimal("38000"), "University Lane, Colombo", new BigDecimal("1.2"), null, "Kasun Silva"),
                    new Room("Modern room with a garden view", "A freshly painted room with plenty of natural light and a comfortable study corner.", new BigDecimal("50000"), "Park Avenue, Colombo", new BigDecimal("1.6"), null, "Amaya Fernando"),
                    new Room("A little place near everything", "Walk to campus, cafes, and the bus stop from this clean and welcoming shared home.", new BigDecimal("35000"), "Temple Street, Colombo", new BigDecimal("0.6"), null, "Ruwan Jayasuriya"),
                    new Room("Quiet room, lovely housemates", "A peaceful furnished room with shared living areas and a well-equipped kitchen.", new BigDecimal("46000"), "Lake Road, Colombo", new BigDecimal("2.1"), null, "Sajini Perera"),
                    new Room("Simple, bright, and close by", "An airy room in a small, quiet home. Utilities and high-speed internet are included.", new BigDecimal("40000"), "Station Road, Colombo", new BigDecimal("1.0"), null, "Dilan Wickramasinghe"),
                    new Room("Your own peaceful corner", "Comfortable private room with a balcony, study desk, and secure parking for a bicycle.", new BigDecimal("52000"), "Green Path, Colombo", new BigDecimal("2.4"), null, "Tharushi Silva"),
                    new Room("A warm home near campus", "Move-in ready room with a shared lounge, weekly cleaning of common areas, and Wi-Fi.", new BigDecimal("44000"), "Campus View, Colombo", new BigDecimal("1.4"), null, "Ishara Fernando")
            ));
        };
    }
}
