package com.mediastris.contact;
import java.time.Instant;
public interface EmailService { void send(ContactRequest enquiry, String reference, Instant timestamp); }
