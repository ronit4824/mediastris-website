package com.mediastris.contact;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactService service;
    public ContactController(ContactService service){this.service=service;}
    @PostMapping(consumes=MediaType.APPLICATION_JSON_VALUE,produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ContactService.Receipt> contact(@Valid @RequestBody ContactRequest request,@RequestHeader(value="Idempotency-Key",defaultValue="") String key) {
        if(!key.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"))
            throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_REFERENCE","A valid Idempotency-Key UUID header is required.");
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.submit(request,key));
    }
}
