package com.mediastris.careers;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.Instant;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
class CareersEmailTest {
    @Test @SuppressWarnings("unchecked") void emailContainsDetailsTimestampAndAttachment()throws Exception{var sender=mock(JavaMailSender.class);when(sender.createMimeMessage()).thenReturn(new MimeMessage((Session)null));ObjectProvider<JavaMailSender> provider=mock(ObjectProvider.class);when(provider.getIfAvailable()).thenReturn(sender);var service=new SmtpCareersEmailService(provider,"smtp.example.test","website@example.test","careers@example.test");var request=CareersApplicationTest.request();request.setCurrentCtc("Test current");request.setExpectedCtc("Test expected");request.setCoverMessage("Synthetic cover message");var time=Instant.parse("2026-10-18T00:00:00Z");service.send(request,"Synthetic Test Role",new ResumeValidator().validate(new org.springframework.mock.web.MockMultipartFile("resume","resume.pdf","application/pdf",CareersApplicationTest.pdf())),"reference",time);var captor=ArgumentCaptor.forClass(MimeMessage.class);verify(sender).send(captor.capture());var message=captor.getValue();message.saveChanges();assertThat(message.getSubject()).isEqualTo("New Job Application — Mediastris Healthcare — Synthetic Test Role");var output=new java.io.ByteArrayOutputStream();message.writeTo(output);String mail=output.toString(java.nio.charset.StandardCharsets.UTF_8);assertThat(mail).contains("applicant@example.test","resume.pdf",time.toString(),"Synthetic cover message","Test current","Test expected");}
    @Test @SuppressWarnings("unchecked") void unconfiguredMailboxFailsHonestly(){ObjectProvider<JavaMailSender> provider=mock(ObjectProvider.class);assertThatThrownBy(()->new SmtpCareersEmailService(provider,"","","").send(CareersApplicationTest.request(),"Synthetic",null,"ref",Instant.now())).isInstanceOf(com.mediastris.contact.ApiException.class);}
}
