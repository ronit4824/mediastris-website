package com.mediastris.contact;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
@Service
public class ContactService {
    public record Receipt(String reference,String email,SmsService.Status sms) {}
    private static class Entry { final String fingerprint; final Instant created; Receipt receipt; Entry(String f,Instant t){fingerprint=f;created=t;} }
    private final Map<String,Entry> submissions=new ConcurrentHashMap<>();
    private final EmailService email; private final SmsService sms; private final Clock clock;
    private final Logger log=LoggerFactory.getLogger(ContactService.class);
    @org.springframework.beans.factory.annotation.Autowired
    public ContactService(EmailService email,SmsService sms){this(email,sms,Clock.systemUTC());}
    ContactService(EmailService email,SmsService sms,Clock clock){this.email=email;this.sms=sms;this.clock=clock;}
    public Receipt submit(ContactRequest request,String key) {
        Instant now=clock.instant();String hash=fingerprint(request);Entry entry;
        synchronized(submissions) {
            submissions.entrySet().removeIf(e->e.getValue().created.plus(Duration.ofHours(1)).isBefore(now));
            entry=submissions.get(key);
            if(entry!=null) {
                if(!entry.fingerprint.equals(hash)) throw new ApiException(HttpStatus.CONFLICT,"KEY_REUSED","Use a new reference for a different enquiry.");
                if(entry.receipt!=null) return entry.receipt;
                throw new ApiException(HttpStatus.CONFLICT,"IN_PROGRESS","This enquiry is still being processed.");
            }
            if(submissions.size()>=5000) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"CAPACITY","Please try again later.");
            entry=new Entry(hash,now);submissions.put(key,entry);
        }
        try {email.send(request,key,now);} catch(RuntimeException ex) {synchronized(submissions){submissions.remove(key,entry);} throw ex;}
        SmsService.Status smsStatus;
        try {smsStatus=sms.notifyEnquiry(key);} catch(RuntimeException ex) {smsStatus=SmsService.Status.failed;}
        if(smsStatus==SmsService.Status.failed || smsStatus==SmsService.Status.unconfigured) log.warn("Optional SMS notification status: {}",smsStatus);
        Receipt receipt=new Receipt(key,"accepted",smsStatus);
        synchronized(submissions){entry.receipt=receipt;}
        return receipt;
    }
    private static String fingerprint(ContactRequest r) {
        try {StringBuilder payload=new StringBuilder();for(String part:List.of(r.name(),r.email(),r.phone(),r.company(),r.service(),r.message()))payload.append(part.length()).append(':').append(part);return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.toString().getBytes(StandardCharsets.UTF_8)));}
        catch(java.security.NoSuchAlgorithmException ex){throw new IllegalStateException(ex);}
    }
}
