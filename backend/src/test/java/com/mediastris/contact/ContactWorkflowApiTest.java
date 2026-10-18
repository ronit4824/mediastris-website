package com.mediastris.contact;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc
class ContactWorkflowApiTest {
    @Autowired MockMvc mvc;
    @MockitoBean EmailService email;
    @MockitoBean SmsService sms;
    private static final String BODY="""
      {"name":"Test Person","email":"person@example.test","phone":"+91 98765 43210","company":"Test Organization","service":"General enquiry","message":"A synthetic test enquiry."}
      """;
    @Test void successAndReplayUseSingleNotification()throws Exception{when(sms.notifyEnquiry(anyString())).thenReturn(SmsService.Status.disabled);String key=java.util.UUID.randomUUID().toString();for(int i=0;i<2;i++)mvc.perform(post("/api/contact").contentType("application/json").header("Idempotency-Key",key).content(BODY)).andExpect(status().isOk()).andExpect(jsonPath("email").value("accepted")).andExpect(jsonPath("sms").value("disabled"));verify(email,times(1)).send(any(),eq(key),any());}
    @Test void failureCannotReturnSuccess()throws Exception{doThrow(new ApiException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_FAILED","Notification unavailable")).when(email).send(any(),anyString(),any());mvc.perform(post("/api/contact").contentType("application/json").header("Idempotency-Key",java.util.UUID.randomUUID()).content(BODY)).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("email").doesNotExist());verifyNoInteractions(sms);}
}
