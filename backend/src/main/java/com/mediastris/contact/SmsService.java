package com.mediastris.contact;
public interface SmsService {
    enum Status { disabled, unconfigured, accepted, failed }
    Status notifyEnquiry(String reference);
}
