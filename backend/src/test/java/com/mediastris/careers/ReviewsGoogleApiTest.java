package com.mediastris.careers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"app.reviews.mode=GOOGLE","app.reviews.google-place-id=","app.reviews.google-api-key="}) @AutoConfigureMockMvc
class ReviewsGoogleApiTest {
 @Autowired MockMvc mvc;
 @Test void unconfiguredGoogleReturnsNoFakeReviews()throws Exception{
  mvc.perform(get("/api/reviews")).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store")).andExpect(jsonPath("mode").value("GOOGLE")).andExpect(jsonPath("status").value("unconfigured")).andExpect(jsonPath("reviews.length()").value(0));
 }
}
