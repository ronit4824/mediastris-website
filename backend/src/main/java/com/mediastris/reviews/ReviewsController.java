package com.mediastris.reviews;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController
public class ReviewsController {
    private final ReviewsSource source;
    public ReviewsController(DemoReviewsService demo,GoogleReviewsService google,@Value("${app.reviews.mode:DEMO}") String mode){
        source=switch(mode.trim().toUpperCase(java.util.Locale.ROOT)){case "DEMO"->demo;case "GOOGLE"->google;default->throw new IllegalArgumentException("REVIEWS_MODE must be DEMO or GOOGLE");};
    }
    @GetMapping("/api/reviews") public ResponseEntity<ReviewsPayload> reviews(){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(source.load());}
}
