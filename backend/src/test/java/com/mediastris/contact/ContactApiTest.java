package com.mediastris.contact;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
class ContactApiTest {
    @Autowired MockMvc mvc;
    private static final String BODY="""
      {"name":"Test Person","email":"person@example.test","phone":"+91 98765 43210","company":"Test Organization","service":"General enquiry","message":"A synthetic test enquiry."}
      """;
    @Test void invalidFieldsReturnStructuredErrors() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.1");return r;}).contentType("application/json").content("{}" )).andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("VALIDATION_FAILED")).andExpect(jsonPath("fields.email").exists()).andExpect(jsonPath("trace").doesNotExist());}
    @Test void unconfiguredSmtpFailsHonestly() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.2");return r;}).contentType("application/json").header("Idempotency-Key",java.util.UUID.randomUUID()).content(BODY)).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("code").value("EMAIL_UNAVAILABLE"));}
    @Test void missingReferenceRejected() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.3");return r;}).contentType("application/json").content(BODY)).andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_REFERENCE"));}
    @Test void corsRejectsUnapprovedOrigin() throws Exception {mvc.perform(options("/api/contact").header("Origin","https://untrusted.example").header("Access-Control-Request-Method","POST")).andExpect(status().isForbidden());}
    @Test void corsAllowsConfiguredOrigin() throws Exception {mvc.perform(options("/api/contact").header("Origin","http://localhost:5173").header("Access-Control-Request-Method","POST").header("Access-Control-Request-Headers","Content-Type, Idempotency-Key")).andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin","http://localhost:5173"));}
    @Test void oversizedBodiesRejected() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.4");return r;}).contentType("application/json").content("x".repeat(25000))).andExpect(status().isPayloadTooLarge());}
    @Test void limitsRepeatedRequests() throws Exception {for(int i=0;i<8;i++)mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.5");return r;}).contentType("application/json").content("{}" )).andExpect(status().isBadRequest());mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.5");return r;}).contentType("application/json").content("{}" )).andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));}
    @Test void headerInjectionAndShortPhoneRejected() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.6");return r;}).contentType("application/json").content(BODY.replace("Test Person","Test\\r\\nInjected").replace("+91 98765 43210","123"))).andExpect(status().isBadRequest()).andExpect(jsonPath("fields.name").exists()).andExpect(jsonPath("fields.phone").exists());}
    @Test void malformedJsonIsSafe() throws Exception {mvc.perform(post("/api/contact").with(r->{r.setRemoteAddr("10.0.0.7");return r;}).contentType("application/json").content("{")).andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_JSON"));}
}
