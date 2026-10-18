package com.mediastris.careers;
import java.time.Instant;
public interface CareersEmailService {void send(CareersApplicationRequest request,String position,ResumeValidator.Resume resume,String reference,Instant timestamp);}
