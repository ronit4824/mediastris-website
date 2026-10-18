package com.mediastris.careers;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mediastris.contact.ApiException;
@RestController
public class CareersApplicationController {
    private final CareersApplicationService service;
    public CareersApplicationController(CareersApplicationService service){this.service=service;}
    @PostMapping(value="/api/careers/apply",consumes=MediaType.MULTIPART_FORM_DATA_VALUE,produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CareersApplicationService.Receipt> apply(@Valid @ModelAttribute CareersApplicationRequest request,@RequestPart("resume")MultipartFile resume,@RequestHeader(value="Idempotency-Key",defaultValue="")String key){if(!key.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"))throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_REFERENCE","A valid Idempotency-Key UUID header is required.");return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.apply(request,resume,key));}
}
