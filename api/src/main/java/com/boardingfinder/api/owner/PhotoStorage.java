package com.boardingfinder.api.owner;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface PhotoStorage {
    String store(MultipartFile file, String extension) throws IOException;
}
