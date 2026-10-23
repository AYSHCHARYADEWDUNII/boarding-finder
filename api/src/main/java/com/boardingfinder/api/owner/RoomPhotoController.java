package com.boardingfinder.api.owner;

import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/owner/rooms/images")
@CrossOrigin(
        origins = "${app.cors.allowed-origin:http://localhost:3000}",
        allowCredentials = "true"
)
public class RoomPhotoController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final Path uploadDirectory;
    private final String publicBaseUrl;

    public RoomPhotoController(
            @Value("${app.upload.directory:uploads/boarding-photos}") String uploadDirectory,
            @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(
            @NotNull @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal OwnerAccount owner
    ) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a photo to upload");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Photos must be 5 MB or smaller");
        }

        String extension = validatedExtension(file);
        String filename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(uploadDirectory);
            Path destination = uploadDirectory.resolve(filename).normalize();
            if (!destination.getParent().equals(uploadDirectory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid photo filename");
            }
            try (var input = file.getInputStream()) {
                Files.copy(input, destination);
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "The photo could not be saved",
                    exception
            );
        }

        return Map.of("imageUrl", publicBaseUrl + "/uploads/boarding-photos/" + filename);
    }

    private String validatedExtension(MultipartFile file) {
        String contentType = file.getContentType();
        byte[] header;
        try (var input = file.getInputStream()) {
            header = input.readNBytes(12);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the photo", exception);
        }

        if (MediaType.IMAGE_JPEG_VALUE.equalsIgnoreCase(contentType)
                && header.length >= 3
                && (header[0] & 0xff) == 0xff
                && (header[1] & 0xff) == 0xd8
                && (header[2] & 0xff) == 0xff) {
            return ".jpg";
        }
        if (MediaType.IMAGE_PNG_VALUE.equalsIgnoreCase(contentType)
                && header.length >= 8
                && (header[0] & 0xff) == 0x89
                && header[1] == 'P'
                && header[2] == 'N'
                && header[3] == 'G'
                && header[4] == 0x0d
                && header[5] == 0x0a
                && header[6] == 0x1a
                && header[7] == 0x0a) {
            return ".png";
        }
        if ("image/webp".equalsIgnoreCase(contentType)
                && header.length >= 12
                && new String(header, 0, 4).equals("RIFF")
                && new String(header, 8, 4).equals("WEBP")) {
            return ".webp";
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Upload a valid JPEG, PNG, or WebP image"
        );
    }
}
