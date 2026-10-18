package com.mediastris.contact;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class TwilioSmsService implements SmsService {
    private final boolean enabled;
    private final String sid,token,from,to;
    private final HttpClient client;
    private final ObjectMapper json=new ObjectMapper();
    @org.springframework.beans.factory.annotation.Autowired
    public TwilioSmsService(@Value("${app.sms.enabled:false}") boolean enabled,@Value("${app.sms.account-sid:}") String sid,@Value("${app.sms.auth-token:}") String token,@Value("${app.sms.from:}") String from,@Value("${app.sms.to:}") String to) {this(enabled,sid,token,from,to,HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).followRedirects(HttpClient.Redirect.NEVER).build());}
    TwilioSmsService(boolean enabled,String sid,String token,String from,String to,HttpClient client) {this.enabled=enabled;this.sid=sid;this.token=token;this.from=from;this.to=to;this.client=client;}
    public Status notifyEnquiry(String reference) {
        if(!enabled) return Status.disabled;
        if(!sid.matches("AC[0-9a-fA-F]{32}") || token.isBlank() || from.isBlank() || to.isBlank()) return Status.unconfigured;
        try {
            String body="From="+encode(from)+"&To="+encode(to)+"&Body="+encode("New Mediastris website enquiry. Reference: "+reference+". Please check the company mailbox.");
            var request=HttpRequest.newBuilder(URI.create("https://api.twilio.com/2010-04-01/Accounts/"+sid+"/Messages.json"))
                .timeout(Duration.ofSeconds(5)).header("Authorization","Basic "+Base64.getEncoder().encodeToString((sid+":"+token).getBytes(StandardCharsets.UTF_8)))
                .header("Content-Type","application/x-www-form-urlencoded").POST(HttpRequest.BodyPublishers.ofString(body)).build();
            var response=client.send(request,HttpResponse.BodyHandlers.ofString());
            if(response.statusCode()!=201) return Status.failed;
            var result=json.readTree(response.body());
            return result.path("sid").asText().startsWith("SM") && java.util.Set.of("accepted","queued","sending","sent","delivered").contains(result.path("status").asText()) ? Status.accepted : Status.failed;
        } catch(InterruptedException ex) {Thread.currentThread().interrupt();return Status.failed;} catch(Exception ex) {return Status.failed;}
    }
    private static String encode(String text) {return URLEncoder.encode(text,StandardCharsets.UTF_8);}
}
