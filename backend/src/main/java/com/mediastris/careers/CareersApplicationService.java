package com.mediastris.careers;
import java.time.*;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import com.mediastris.contact.ApiException;
@Service
public class CareersApplicationService {
    public record Receipt(String reference,String email){}
    private static class Submission{final String hash;final Instant time;Receipt receipt;Submission(String hash,Instant time){this.hash=hash;this.time=time;}}
    private final Map<String,Submission> submissions=new HashMap<>();
    private final CareersCatalogue catalogue;private final ResumeValidator validator;private final CareersEmailService email;
    public CareersApplicationService(CareersCatalogue catalogue,ResumeValidator validator,CareersEmailService email){this.catalogue=catalogue;this.validator=validator;this.email=email;}
    public Receipt apply(CareersApplicationRequest request,MultipartFile file,String key){String position=catalogue.resolve(request.getPosition());var resume=validator.validate(file);String hash=hash(request,resume);Instant now=Instant.now();Submission submission;
        synchronized(submissions){submissions.entrySet().removeIf(entry->entry.getValue().time.plusSeconds(3600).isBefore(now));submission=submissions.get(key);if(submission!=null){if(!submission.hash.equals(hash))throw new ApiException(HttpStatus.CONFLICT,"KEY_REUSED","Use a new reference for a different application.");if(submission.receipt!=null)return submission.receipt;throw new ApiException(HttpStatus.CONFLICT,"IN_PROGRESS","This application is still being processed.");}if(submissions.size()>=1000)throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"CAPACITY","Please try again later.");submission=new Submission(hash,now);submissions.put(key,submission);}
        try{email.send(request,position,resume,key,now);}catch(RuntimeException ex){synchronized(submissions){submissions.remove(key,submission);}throw ex;}var receipt=new Receipt(key,"accepted");synchronized(submissions){submission.receipt=receipt;}return receipt;
    }
    private String hash(CareersApplicationRequest r,ResumeValidator.Resume resume){try{var digest=MessageDigest.getInstance("SHA-256");for(String field:List.of(r.getFullName(),r.getEmail(),r.getPhone(),r.getPosition(),r.getCurrentLocation(),r.getTotalExperience(),r.getNoticePeriod(),r.getCurrentCtc(),r.getExpectedCtc(),r.getCoverMessage())){byte[] bytes=field.getBytes(StandardCharsets.UTF_8);digest.update(java.nio.ByteBuffer.allocate(4).putInt(bytes.length).array());digest.update(bytes);}digest.update(resume.bytes());return HexFormat.of().formatHex(digest.digest());}catch(java.security.NoSuchAlgorithmException ex){throw new IllegalStateException(ex);}}
}
