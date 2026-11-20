package com.boardingfinder.api.owner;

import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/owner/rooms/images")
public class RoomPhotoController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final PhotoStorage photoStorage;

    @Autowired
    public RoomPhotoController(PhotoStorage photoStorage) {
        this.photoStorage = photoStorage;
    }

    public RoomPhotoController(String uploadDirectory, String publicBaseUrl) {
        this.photoStorage = new LocalPhotoStorage(uploadDirectory, publicBaseUrl);
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
        try {
            return Map.of("imageUrl", photoStorage.store(file, extension));
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "The photo could not be saved",
                    exception
            );
        }
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
