package com.mediastris.careers;
import jakarta.validation.constraints.*;
public class CareersApplicationRequest {
    @NotBlank @Size(min=2,max=100) @Pattern(regexp="[^\\r\\n]+") private String fullName;
    @NotBlank @Email @Size(max=254) @Pattern(regexp="[^\\r\\n]+") private String email;
    @NotBlank @Size(max=24) @Pattern(regexp="(?=(?:[^0-9]*[0-9]){7,15}[^0-9]*$)\\+?[0-9 ()-]+") private String phone;
    @NotBlank @Pattern(regexp="[a-z0-9-]{1,100}") private String position;
    @NotBlank @Size(max=160) private String currentLocation;
    @NotBlank @Size(max=60) private String totalExperience;
    @NotBlank @Size(max=60) private String noticePeriod;
    @Size(max=80) private String currentCtc="";
    @Size(max=80) private String expectedCtc="";
    @Size(max=4000) private String coverMessage="";
    private static String clean(String value){return value==null?"":value.trim();}
    public String getFullName(){return fullName;}public void setFullName(String v){fullName=clean(v);}
    public String getEmail(){return email;}public void setEmail(String v){email=clean(v);}
    public String getPhone(){return phone;}public void setPhone(String v){phone=clean(v);}
    public String getPosition(){return position;}public void setPosition(String v){position=clean(v);}
    public String getCurrentLocation(){return currentLocation;}public void setCurrentLocation(String v){currentLocation=clean(v);}
    public String getTotalExperience(){return totalExperience;}public void setTotalExperience(String v){totalExperience=clean(v);}
    public String getNoticePeriod(){return noticePeriod;}public void setNoticePeriod(String v){noticePeriod=clean(v);}
    public String getCurrentCtc(){return currentCtc;}public void setCurrentCtc(String v){currentCtc=clean(v);}
    public String getExpectedCtc(){return expectedCtc;}public void setExpectedCtc(String v){expectedCtc=clean(v);}
    public String getCoverMessage(){return coverMessage;}public void setCoverMessage(String v){coverMessage=clean(v);}
    public String body(){return "Full Name: "+fullName+"\nEmail Address: "+email+"\nPhone Number: "+phone+"\nPosition ID: "+position+"\nCurrent Location: "+currentLocation+"\nTotal Experience: "+totalExperience+"\nNotice Period: "+noticePeriod+"\nCurrent CTC: "+currentCtc+"\nExpected CTC: "+expectedCtc+"\nCover Message:\n"+coverMessage;}
    @Override public String toString(){return "CareersApplicationRequest[redacted]";}
}
