package com.mediastris.contact;
import java.time.Instant;
import java.util.regex.Pattern;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class SmtpEmailService implements EmailService {
    private final ObjectProvider<JavaMailSender> sender;
    private final String host,from,to;
    private static final Pattern MAILBOX=Pattern.compile("[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+");
    public SmtpEmailService(ObjectProvider<JavaMailSender> sender,@Value("${spring.mail.host:}") String host,@Value("${app.contact-from:}") String from,@Value("${app.contact-to:}") String to) {this.sender=sender;this.host=host;this.from=from;this.to=to;}
    public void send(ContactRequest e,String reference,Instant timestamp) {
        JavaMailSender mail=sender.getIfAvailable();
        if(host.isBlank() || !MAILBOX.matcher(from).matches() || !MAILBOX.matcher(to).matches() || mail==null)
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_UNAVAILABLE","Enquiry notifications are temporarily unavailable.");
        SimpleMailMessage message=new SimpleMailMessage();message.setFrom(from);message.setTo(to);message.setReplyTo(e.email());
        message.setSubject("Website enquiry — "+reference);
        message.setText("New website enquiry\nReference: "+reference+"\nTimestamp (UTC): "+timestamp+"\nName: "+e.name()+"\nEmail: "+e.email()+"\nPhone: "+e.phone()+"\nCompany/Organization: "+e.company()+"\nService of interest: "+e.service()+"\n\nMessage:\n"+e.message());
        try {mail.send(message);} catch(RuntimeException ex) {throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_FAILED","Email acceptance could not be confirmed. Retry with the same enquiry reference.");}
    }
}
