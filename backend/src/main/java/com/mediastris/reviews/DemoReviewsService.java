package com.mediastris.reviews;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
@Service
public class DemoReviewsService implements ReviewsSource {
    private final ReviewsPayload payload;
    public DemoReviewsService(ObjectMapper mapper)throws java.io.IOException{
        try(var input=new ClassPathResource("catalogue/reviews.json").getInputStream()){
            List<ReviewsPayload.Review> reviews=mapper.readValue(input,new TypeReference<>(){});
            payload=new ReviewsPayload("DEMO","ready",reviews.stream().map(r->new ReviewsPayload.Review(r.id(),r.name(),r.rating(),r.text(),r.date(),true,"","","")).toList(),List.of());
        }
    }
    @Override public ReviewsPayload load(){return payload;}
}
