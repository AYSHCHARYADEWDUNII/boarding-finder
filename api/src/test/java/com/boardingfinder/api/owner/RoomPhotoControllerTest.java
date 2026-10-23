package com.boardingfinder.api.owner;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomPhotoControllerTest {

    @TempDir
    Path uploadDirectory;

    @Test
    void uploadSavesValidJpegAndReturnsPublicUrl() throws Exception {
        RoomPhotoController controller = new RoomPhotoController(
                uploadDirectory.toString(),
                "http://localhost:8080/"
        );
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "boarding.jpg",
                "image/jpeg",
                new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff, 0x01}
        );

        String imageUrl = controller.upload(file, null).get("imageUrl");

        assertTrue(imageUrl.startsWith("http://localhost:8080/uploads/boarding-photos/"));
        assertTrue(imageUrl.endsWith(".jpg"));
        try (Stream<Path> files = Files.list(uploadDirectory)) {
            assertEquals(1, files.count());
        }
    }

    @Test
    void uploadRejectsFilesWithInvalidImageContents() {
        RoomPhotoController controller = new RoomPhotoController(
                uploadDirectory.toString(),
                "http://localhost:8080"
        );
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "not an image".getBytes()
        );

        assertThrows(ResponseStatusException.class, () -> controller.upload(file, null));
    }
}
