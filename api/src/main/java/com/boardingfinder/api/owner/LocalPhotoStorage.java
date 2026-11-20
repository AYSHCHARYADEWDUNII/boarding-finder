package com.boardingfinder.api.owner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@Profile("dev")
public class LocalPhotoStorage implements PhotoStorage {

    private final Path uploadDirectory;
    private final String publicBaseUrl;

    public LocalPhotoStorage(
            @Value("${app.upload.directory:uploads/boarding-photos}") String uploadDirectory,
            @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Override
    public String store(MultipartFile file, String extension) throws IOException {
        Files.createDirectories(uploadDirectory);
        String filename = UUID.randomUUID() + extension;
        Path destination = uploadDirectory.resolve(filename).normalize();
        if (!destination.getParent().equals(uploadDirectory)) {
            throw new IOException("Invalid photo filename");
        }
        try (var input = file.getInputStream()) {
            Files.copy(input, destination);
        }
        return publicBaseUrl + "/uploads/boarding-photos/" + filename;
    }
}
