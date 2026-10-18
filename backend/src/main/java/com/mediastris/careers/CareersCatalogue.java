package com.mediastris.careers;
import com.fasterxml.jackson.databind.*;
import com.mediastris.contact.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.io.*;
import java.util.*;
@Component
public class CareersCatalogue {
    private final Map<String,String> jobs=new HashMap<>();
    private final boolean general;
    public CareersCatalogue(ObjectMapper json){try(var stream=getClass().getResourceAsStream("/catalogue/careers.json")){if(stream==null)throw new IOException("Missing careers catalogue");var data=json.readTree(stream);general=data.path("generalApplicationsEnabled").asBoolean(false);for(var job:data.path("jobs")){String id=job.path("id").asText(),title=job.path("title").asText();if(job.path("approved").asBoolean(false)&&id.matches("[a-z0-9-]{1,100}")&&!title.isBlank()&&title.length()<=160&&!title.matches("(?s).*[\\r\\n].*"))jobs.put(id,title);}}catch(IOException ex){throw new IllegalStateException("Unable to load careers configuration");}}
    public String resolve(String position){if(general&&"general".equals(position))return "General Application";String title=jobs.get(position);if(title==null)throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"POSITION_UNAVAILABLE","This position is not accepting applications.");return title;}
}
