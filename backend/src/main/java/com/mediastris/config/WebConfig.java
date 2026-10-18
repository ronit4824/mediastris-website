package com.mediastris.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final String[] origins;
    public WebConfig(@Value("${app.cors-origins}") String origins){this.origins=java.util.Arrays.stream(origins.split(",")).map(String::trim).filter(o->!o.isBlank() && !o.contains("*")).toArray(String[]::new);}
    @Override public void addCorsMappings(CorsRegistry registry){registry.addMapping("/api/reviews").allowedOrigins(origins).allowedMethods("GET").allowedHeaders("Accept").allowCredentials(false).maxAge(600);registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("POST").allowedHeaders("Content-Type","Idempotency-Key").allowCredentials(false).maxAge(600);}
}
