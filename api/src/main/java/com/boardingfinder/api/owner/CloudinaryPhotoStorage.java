package com.boardingfinder.api.owner;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Profile("prod")
public class CloudinaryPhotoStorage implements PhotoStorage {

    private final Cloudinary cloudinary;

    public CloudinaryPhotoStorage(
            @Value("${CLOUDINARY_CLOUD_NAME}") String cloudName,
            @Value("${CLOUDINARY_API_KEY}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET}") String apiSecret
    ) {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    @Override
    public String store(MultipartFile file, String extension) throws IOException {
        Map<?, ?> uploaded = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "boarding-photos",
                        "resource_type", "image"
                )
        );
        Object secureUrl = uploaded.get("secure_url");
        if (secureUrl == null) {
            throw new IOException("Cloudinary did not return an image URL");
        }
        return secureUrl.toString();
    }
}
