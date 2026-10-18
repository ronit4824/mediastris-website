package com.mediastris.contact;
import jakarta.validation.constraints.*;
public record ContactRequest(
    @NotBlank @Size(min=2,max=100) @Pattern(regexp="[^\\r\\n]+") String name,
    @NotBlank @Email @Size(max=254) @Pattern(regexp="[^\\r\\n]+") String email,
    @NotBlank @Size(max=24) @Pattern(regexp="(?=(?:[^0-9]*[0-9]){7,15}[^0-9]*$)\\+?[0-9 ()-]+") String phone,
    @NotBlank @Size(max=160) String company,
    @NotBlank @Size(max=120) String service,
    @NotBlank @Size(min=10,max=4000) String message
) {
    public ContactRequest {
        name=trim(name); email=trim(email); phone=trim(phone); company=trim(company); service=trim(service); message=trim(message);
    }
    private static String trim(String value) { return value==null?null:value.trim(); }
    @Override public String toString() { return "ContactRequest[redacted]"; }
}
