package com.mediastris.careers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc
class ReviewsApiTest {
 @Autowired MockMvc mvc;
 @Test void demoEndpointIsExplicitAndHasNoGoogleAttribution()throws Exception{
  mvc.perform(get("/api/reviews")).andExpect(status().isOk()).andExpect(jsonPath("mode").value("DEMO")).andExpect(jsonPath("reviews.length()").value(4)).andExpect(jsonPath("reviews[0].name").value("Sample Reviewer 01")).andExpect(jsonPath("reviews[0].demo").value(true)).andExpect(jsonPath("reviews[0].authorUrl").value(""));
 }
 @Test void getCorsPreflightWorks()throws Exception{
  mvc.perform(options("/api/reviews").header("Origin","http://localhost:5173").header("Access-Control-Request-Method","GET")).andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5173"));
 }
}
