package com.mediastris.contact;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSender;
class SmtpEmailServiceTest {
    private final ContactRequest request=new ContactRequest("Test Person","person@example.test","+91 98765 43210","Test Organization","General enquiry","A synthetic test message.");
    @SuppressWarnings("unchecked")
    private SmtpEmailService service(JavaMailSender sender){ObjectProvider<JavaMailSender> provider=mock(ObjectProvider.class);when(provider.getIfAvailable()).thenReturn(sender);return new SmtpEmailService(provider,"smtp.example.test","website@example.test","office@example.test");}
    @Test void emailContainsAllFieldsAndTimestamp(){var sender=mock(JavaMailSender.class);var service=service(sender);var timestamp=Instant.parse("2026-10-17T10:00:00Z");service.send(request,"synthetic-reference",timestamp);var captor=ArgumentCaptor.forClass(SimpleMailMessage.class);verify(sender).send(captor.capture());var message=captor.getValue();assertThat(message.getTo()).containsExactly("office@example.test");assertThat(message.getReplyTo()).isEqualTo(request.email());assertThat(message.getText()).contains(request.name(),request.email(),request.phone(),request.company(),request.service(),request.message(),timestamp.toString());}
    @Test void smtpFailureReturnsSafeUnavailableError(){var sender=mock(JavaMailSender.class);doThrow(new MailSendException("synthetic secret provider failure")).when(sender).send(any(SimpleMailMessage.class));assertThatThrownBy(()->service(sender).send(request,"test",Instant.now())).isInstanceOf(ApiException.class).hasMessageNotContaining("secret");}
}
