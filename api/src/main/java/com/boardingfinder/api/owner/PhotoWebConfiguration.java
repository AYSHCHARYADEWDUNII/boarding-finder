package com.boardingfinder.api.owner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class PhotoWebConfiguration implements WebMvcConfigurer {

    private final String uploadLocation;

    public PhotoWebConfiguration(
            @Value("${app.upload.directory:uploads/boarding-photos}") String uploadDirectory
    ) {
        this.uploadLocation = Path.of(uploadDirectory).toAbsolutePath().normalize().toUri() + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/boarding-photos/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(3600);
    }
}
