package com.mediastris.careers;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.io.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.apache.pdfbox.pdmodel.*;
import org.springframework.mock.web.MockMultipartFile;
import com.mediastris.contact.ApiException;

class CareersApplicationTest {
    static byte[] pdf()throws Exception{try(var doc=new PDDocument();var out=new ByteArrayOutputStream()){doc.addPage(new PDPage());doc.save(out);return out.toByteArray();}}
    static CareersApplicationRequest request(){var r=new CareersApplicationRequest();r.setFullName("Synthetic Applicant");r.setEmail("applicant@example.test");r.setPhone("+91 98765 43210");r.setPosition("synthetic-role");r.setCurrentLocation("Test Location");r.setTotalExperience("2 years");r.setNoticePeriod("30 days");return r;}
    @Test void emptyCatalogueRejectsInventedJobs(){var catalogue=new CareersCatalogue(new com.fasterxml.jackson.databind.ObjectMapper());assertThatThrownBy(()->catalogue.resolve("synthetic-role")).isInstanceOf(ApiException.class);assertThatThrownBy(()->catalogue.resolve("general")).isInstanceOf(ApiException.class);}
    @Test void validatesRealPdfAndSanitizesFilename()throws Exception{var resume=new ResumeValidator().validate(new MockMultipartFile("resume","../../unsafe resume.pdf","application/pdf",pdf()));assertThat(resume.filename()).isEqualTo("resume.pdf");assertThat(resume.contentType()).isEqualTo("application/pdf");}
    @Test void rejectsFakePdfExecutablesAndOversizedUploads(){var validator=new ResumeValidator();for(var file:List.of(new MockMultipartFile("resume","x.pdf","application/pdf","MZbad".getBytes()),new MockMultipartFile("resume","x.exe","application/octet-stream","%PDF-1.7".getBytes()),new MockMultipartFile("resume","x.pdf","application/pdf",new byte[5*1024*1024+1]))){assertThatThrownBy(()->validator.validate(file)).isInstanceOf(ApiException.class);}}
    @Test void rejectsActivePdf()throws Exception{try(var doc=new PDDocument();var out=new ByteArrayOutputStream()){doc.addPage(new PDPage());doc.getDocumentCatalog().getCOSObject().setString(org.apache.pdfbox.cos.COSName.getPDFName("JS"),"unsafe");doc.save(out);assertThatThrownBy(()->new ResumeValidator().validate(new MockMultipartFile("resume","x.pdf","application/pdf",out.toByteArray()))).isInstanceOf(ApiException.class);}}
    @Test void duplicateApplicationEmailsOnlyOnce()throws Exception{var catalogue=mock(CareersCatalogue.class);when(catalogue.resolve("synthetic-role")).thenReturn("Synthetic Test Role");var mail=mock(CareersEmailService.class);var service=new CareersApplicationService(catalogue,new ResumeValidator(),mail);var file=new MockMultipartFile("resume","resume.pdf","application/pdf",pdf());String key=UUID.randomUUID().toString();assertThat(service.apply(request(),file,key).email()).isEqualTo("accepted");assertThat(service.apply(request(),file,key).email()).isEqualTo("accepted");verify(mail,times(1)).send(any(),eq("Synthetic Test Role"),any(),eq(key),any());}
    @Test void smtpFailureCannotReturnSuccessAndCanRetry()throws Exception{var catalogue=mock(CareersCatalogue.class);when(catalogue.resolve(anyString())).thenReturn("Synthetic Test Role");var mail=mock(CareersEmailService.class);doThrow(new ApiException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"EMAIL_FAILED","Unavailable")).doNothing().when(mail).send(any(),anyString(),any(),anyString(),any());var service=new CareersApplicationService(catalogue,new ResumeValidator(),mail);var file=new MockMultipartFile("resume","resume.pdf","application/pdf",pdf());String key=UUID.randomUUID().toString();assertThatThrownBy(()->service.apply(request(),file,key)).isInstanceOf(ApiException.class);assertThat(service.apply(request(),file,key).email()).isEqualTo("accepted");}
}
