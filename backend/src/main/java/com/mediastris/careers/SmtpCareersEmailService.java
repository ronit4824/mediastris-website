package com.mediastris.careers;
import java.time.Instant;
import com.mediastris.contact.ApiException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
@Service
public class SmtpCareersEmailService implements CareersEmailService {
    private final ObjectProvider<JavaMailSender> provider;private final String host,from,to;
    public SmtpCareersEmailService(ObjectProvider<JavaMailSender> provider,@Value("${spring.mail.host:}")String host,@Value("${app.contact-from:}")String from,@Value("${app.careers-receiver-email:}")String to){this.provider=provider;this.host=host;this.from=from;this.to=to;}
    public void send(CareersApplicationRequest request,String position,ResumeValidator.Resume resume,String reference,Instant timestamp){var sender=provider.getIfAvailable();if(sender==null||host.isBlank()||!mailbox(from)||!mailbox(to))throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_UNAVAILABLE","Application notifications are temporarily unavailable.");try{var message=sender.createMimeMessage();var helper=new MimeMessageHelper(message,true,"UTF-8");helper.setFrom(from);helper.setTo(to);helper.setReplyTo(request.getEmail());helper.setSubject("New Job Application — Mediastris Healthcare — "+position);helper.setText("New job application\nPosition: "+position+"\nReference: "+reference+"\nTimestamp (UTC): "+timestamp+"\n\n"+request.body(),false);helper.addAttachment(resume.filename(),new ByteArrayResource(resume.bytes()),resume.contentType());sender.send(message);}catch(Exception ex){throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_FAILED","Application email acceptance could not be confirmed.");}}
    private boolean mailbox(String value){return value.matches("[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+");}
}
