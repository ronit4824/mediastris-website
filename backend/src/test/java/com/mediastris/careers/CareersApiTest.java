package com.mediastris.careers;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import org.springframework.mock.web.MockMultipartFile;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc
class CareersApiTest {
    private static byte[] resume; @BeforeAll static void resumeFixture()throws Exception{resume=CareersApplicationTest.pdf();}
    @Autowired MockMvc mvc; @MockitoBean CareersCatalogue catalogue; @MockitoBean CareersEmailService email;
    @BeforeEach void fixture(){when(catalogue.resolve("synthetic-role")).thenReturn("Synthetic Test Role");}
    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder application(String address)throws Exception{return multipart("/api/careers/apply").file(new MockMultipartFile("resume","resume.pdf","application/pdf",resume)).param("fullName","Synthetic Applicant").param("email","applicant@example.test").param("phone","+91 98765 43210").param("position","synthetic-role").param("currentLocation","Test Location").param("totalExperience","2 years").param("noticePeriod","30 days").with(request->{request.setRemoteAddr(address);return request;});}
    @Test void multipartSuccessAndReplaySendOnce()throws Exception{String key=java.util.UUID.randomUUID().toString();for(int i=0;i<2;i++)mvc.perform(application("10.2.0.1").header("Idempotency-Key",key)).andExpect(status().isOk()).andExpect(jsonPath("email").value("accepted"));verify(email,times(1)).send(any(),eq("Synthetic Test Role"),any(),eq(key),any());}
    @Test void missingResumeAndRequiredFieldsAreSafe()throws Exception{mvc.perform(multipart("/api/careers/apply").with(r->{r.setRemoteAddr("10.2.0.2");return r;})).andExpect(status().isBadRequest());verifyNoInteractions(email);}
    @Test void validationDoesNotExposePii()throws Exception{mvc.perform(application("10.2.0.3").param("email","invalid").header("Idempotency-Key",java.util.UUID.randomUUID())).andExpect(status().isBadRequest()).andExpect(jsonPath("trace").doesNotExist());}
    @Test void smtpFailureNeverReturnsSuccess()throws Exception{doThrow(new com.mediastris.contact.ApiException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_FAILED","Email unavailable")).when(email).send(any(),any(),any(),any(),any());mvc.perform(application("10.2.0.4").header("Idempotency-Key",java.util.UUID.randomUUID())).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("email").doesNotExist());}
    @Test void invalidReferenceAndSpoofedUploadRejected()throws Exception{mvc.perform(application("10.2.0.5")).andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_REFERENCE"));mvc.perform(multipart("/api/careers/apply").file(new MockMultipartFile("resume","x.pdf","application/pdf","MZunsafe".getBytes())).param("fullName","Test Applicant").param("email","applicant@example.test").param("phone","9876543210").param("position","synthetic-role").param("currentLocation","Test").param("totalExperience","1 year").param("noticePeriod","30 days").header("Idempotency-Key",java.util.UUID.randomUUID()).with(r->{r.setRemoteAddr("10.2.0.6");return r;})).andExpect(status().isBadRequest()).andExpect(jsonPath("code").value("INVALID_RESUME"));}
    @Test void corsRejectsUnapprovedOrigin()throws Exception{mvc.perform(options("/api/careers/apply").header("Origin","https://untrusted.example").header("Access-Control-Request-Method","POST")).andExpect(status().isForbidden());}
    @Test void rateLimitAppliesToApplications()throws Exception{for(int i=0;i<5;i++)mvc.perform(application("10.2.0.7")).andExpect(status().isBadRequest());mvc.perform(application("10.2.0.7")).andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));}
}
