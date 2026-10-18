package com.mediastris.contact;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.io.IOException;
import java.net.http.*;
import org.junit.jupiter.api.Test;
class TwilioSmsServiceTest {
    private TwilioSmsService service(HttpClient client){return new TwilioSmsService(true,"AC"+"0".repeat(32),"synthetic-token","ApprovedSender","+919876543210",client);}
    @SuppressWarnings("unchecked")
    private HttpClient responding(int status,String body)throws Exception{var client=mock(HttpClient.class);HttpResponse<String> response=mock(HttpResponse.class);when(response.statusCode()).thenReturn(status);when(response.body()).thenReturn(body);when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenReturn(response);return client;}
    @Test void providerAcceptanceIsReportedAsAcceptanceOnly()throws Exception{var client=responding(201,"{\"sid\":\"SMsynthetic\",\"status\":\"queued\"}");assertThat(service(client).notifyEnquiry("reference")).isEqualTo(SmsService.Status.accepted);}
    @Test void rejectedProviderRequestFailsGracefully()throws Exception{assertThat(service(responding(401,"{\"message\":\"synthetic credentials rejected\"}")).notifyEnquiry("reference")).isEqualTo(SmsService.Status.failed);}
    @Test void malformedOrFailedAcceptanceCannotClaimSuccess()throws Exception{assertThat(service(responding(201,"{}")).notifyEnquiry("reference")).isEqualTo(SmsService.Status.failed);assertThat(service(responding(201,"{\"sid\":\"SMsynthetic\",\"status\":\"failed\"}")).notifyEnquiry("reference")).isEqualTo(SmsService.Status.failed);}
    @Test @SuppressWarnings("unchecked") void networkFailureFailsGracefully()throws Exception{var client=mock(HttpClient.class);when(client.send(any(HttpRequest.class),any(HttpResponse.BodyHandler.class))).thenThrow(new IOException("synthetic connection failure"));assertThat(service(client).notifyEnquiry("reference")).isEqualTo(SmsService.Status.failed);}
}
