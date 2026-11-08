package com.boardingfinder.api;

import com.boardingfinder.api.room.Room;
import com.boardingfinder.api.room.RoomRepository;
import com.boardingfinder.api.room.BoardingGender;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class BoardingFinderApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardingFinderApiApplication.class, args);
    }

    @Bean
    CommandLineRunner seedRooms(
            RoomRepository roomRepository,
            @Value("${app.campus.latitude:6.9022}") double campusLatitude,
            @Value("${app.campus.longitude:79.8612}") double campusLongitude
    ) {
        return args -> {
            if (roomRepository.count() > 0) {
                return;
            }

            roomRepository.saveAll(List.of(
                    sampleRoom("A sunny room in a shared home", "A bright furnished room with a desk, wardrobe, and a quiet garden to unwind in.", "42000", "College Road, Colombo", BoardingGender.GIRLS, "Nimali Perera", "0770000001", "nimali@example.com", "6.8950", "79.8580", campusLatitude, campusLongitude),
                    sampleRoom("A calm space for focused days", "Private room in a friendly home. Includes Wi-Fi, a shared kitchen, and laundry.", "38000", "University Lane, Colombo", BoardingGender.BOYS, "Kasun Silva", "0770000002", "kasun@example.com", "6.9022", "79.8612", campusLatitude, campusLongitude),
                    sampleRoom("Modern room with a garden view", "A freshly painted room with plenty of natural light and a comfortable study corner.", "50000", "Park Avenue, Colombo", BoardingGender.GIRLS, "Amaya Fernando", "0770000003", "amaya@example.com", "6.9102", "79.8660", campusLatitude, campusLongitude),
                    sampleRoom("A little place near everything", "Walk to campus, cafes, and the bus stop from this clean and welcoming shared home.", "35000", "Temple Street, Colombo", BoardingGender.BOYS, "Ruwan Jayasuriya", "0770000004", "ruwan@example.com", "6.9295", "79.8580", campusLatitude, campusLongitude),
                    sampleRoom("Quiet room, lovely housemates", "A peaceful furnished room with shared living areas and a well-equipped kitchen.", "46000", "Lake Road, Colombo", BoardingGender.GIRLS, "Sajini Perera", "0770000005", "sajini@example.com", "6.8860", "79.8570", campusLatitude, campusLongitude),
                    sampleRoom("Simple, bright, and close by", "An airy room in a small, quiet home. Utilities and high-speed internet are included.", "40000", "Station Road, Colombo", BoardingGender.BOYS, "Dilan Wickramasinghe", "0770000006", "dilan@example.com", "6.9140", "79.8550", campusLatitude, campusLongitude),
                    sampleRoom("Your own peaceful corner", "Comfortable private room with a balcony, study desk, and secure parking for a bicycle.", "52000", "Green Path, Colombo", BoardingGender.BOYS, "Tharushi Silva", "0770000007", "tharushi@example.com", "6.9070", "79.8690", campusLatitude, campusLongitude),
                    sampleRoom("A warm home near campus", "Move-in ready room with a shared lounge, weekly cleaning of common areas, and Wi-Fi.", "44000", "Campus View, Colombo", BoardingGender.GIRLS, "Ishara Fernando", "0770000008", "ishara@example.com", "6.9000", "79.8590", campusLatitude, campusLongitude)
            ));
        };
    }

    private static Room sampleRoom(
            String title,
            String description,
            String price,
            String address,
            BoardingGender boardingFor,
            String ownerName,
            String phone,
            String email,
            String latitude,
            String longitude,
            double campusLatitude,
            double campusLongitude
    ) {
        BigDecimal latitudeValue = new BigDecimal(latitude);
        BigDecimal longitudeValue = new BigDecimal(longitude);
        Room room = new Room(
                title,
                description,
                new BigDecimal(price),
                address,
                haversineDistance(
                        campusLatitude,
                        campusLongitude,
                        latitudeValue.doubleValue(),
                        longitudeValue.doubleValue()
                ),
                null,
                boardingFor,
                ownerName,
                null,
                phone,
                phone,
                email,
                latitudeValue,
                longitudeValue
        );
        room.setImages(List.of(
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
        ));
        return room;
    }

    private static BigDecimal haversineDistance(
            double campusLatitude,
            double campusLongitude,
            double latitude,
            double longitude
    ) {
        double latitudeDelta = Math.toRadians(latitude - campusLatitude);
        double longitudeDelta = Math.toRadians(longitude - campusLongitude);
        double haversine = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2)
                + Math.cos(Math.toRadians(campusLatitude))
                * Math.cos(Math.toRadians(latitude))
                * Math.sin(longitudeDelta / 2)
                * Math.sin(longitudeDelta / 2);
        double distance = 2 * 6371 * Math.atan2(
                Math.sqrt(haversine),
                Math.sqrt(1 - haversine)
        );
        return BigDecimal.valueOf(distance).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
