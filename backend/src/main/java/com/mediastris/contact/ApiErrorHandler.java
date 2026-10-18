package com.mediastris.contact;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
@RestControllerAdvice
public class ApiErrorHandler {
    record Error(String code,String message,Map<String,String> fields) {}
    @ExceptionHandler(ApiException.class) ResponseEntity<Error> api(ApiException e){return ResponseEntity.status(e.status).body(new Error(e.code,e.getMessage(),Map.of()));}
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Error> invalid(MethodArgumentNotValidException e){Map<String,String> fields=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(f->fields.putIfAbsent(f.getField(),"Please enter a valid "+f.getField()+"."));return ResponseEntity.badRequest().body(new Error("VALIDATION_FAILED","Please check the submitted fields.",fields));}
    @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<Error> malformed(){return ResponseEntity.badRequest().body(new Error("INVALID_JSON","Invalid request body.",Map.of()));}
    @ExceptionHandler(org.springframework.validation.BindException.class) ResponseEntity<Error> binding(org.springframework.validation.BindException e){Map<String,String> fields=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(f->fields.putIfAbsent(f.getField(),"Please enter a valid "+f.getField()+"."));return ResponseEntity.badRequest().body(new Error("VALIDATION_FAILED","Please check the submitted fields.",fields));}
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class) ResponseEntity<Error> tooLarge(){return ResponseEntity.status(413).body(new Error("RESUME_TOO_LARGE","Resume must be at most 5 MB.",Map.of("resume","Upload a file up to 5 MB.")));}
    @ExceptionHandler(org.springframework.web.multipart.support.MissingServletRequestPartException.class) ResponseEntity<Error> missingFile(){return ResponseEntity.badRequest().body(new Error("MISSING_RESUME","Please attach a resume.",Map.of("resume","Upload a PDF, DOC or DOCX file up to 5 MB.")));}
    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class) ResponseEntity<Error> multipart(){return ResponseEntity.badRequest().body(new Error("INVALID_MULTIPART","Invalid application upload.",Map.of()));}
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class) ResponseEntity<Error> method(){return ResponseEntity.status(405).body(new Error("METHOD_NOT_ALLOWED","Use POST for enquiries.",Map.of()));}
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class) ResponseEntity<Error> media(){return ResponseEntity.status(415).body(new Error("UNSUPPORTED_MEDIA_TYPE","Unsupported request content type.",Map.of()));}
    @ExceptionHandler(Exception.class) ResponseEntity<Error> unexpected(){return ResponseEntity.internalServerError().body(new Error("INTERNAL_ERROR","The request could not be completed.",Map.of()));}
}
