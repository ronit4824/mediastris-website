package com.mediastris.reviews;
import com.fasterxml.jackson.databind.*;
import com.mediastris.contact.ApiException;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
@Service
public class GoogleReviewsService implements ReviewsSource {
    private final RestClient client;
    private final String placeId,apiKey;
    private final Semaphore inFlight=new Semaphore(2);
    private long window=System.currentTimeMillis(); private int requests;
    @org.springframework.beans.factory.annotation.Autowired
    public GoogleReviewsService(RestClient.Builder builder,@Value("${app.reviews.google-place-id:}") String placeId,@Value("${app.reviews.google-api-key:}") String apiKey){this(configuredClient(builder),placeId,apiKey);}
    public GoogleReviewsService(RestClient client,String placeId,String apiKey){this.client=client;this.placeId=placeId.trim();this.apiKey=apiKey.trim();}
    private static RestClient configuredClient(RestClient.Builder builder){var factory=new SimpleClientHttpRequestFactory();factory.setConnectTimeout(3000);factory.setReadTimeout(6000);return builder.baseUrl("https://places.googleapis.com").requestFactory(factory).build();}
    @Override public ReviewsPayload load(){
        if(!placeId.matches("[A-Za-z0-9_-]{1,256}")||apiKey.isBlank())return ReviewsPayload.empty("unconfigured");
        if(!permit()||!inFlight.tryAcquire())throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"REVIEWS_RATE_LIMITED","Reviews are temporarily unavailable.");
        try {
            JsonNode data=client.get().uri("/v1/places/{id}",placeId).header("X-Goog-Api-Key",apiKey).header("X-Goog-FieldMask","reviews,attributions").exchange((request,response)->{
                if(!response.getStatusCode().is2xxSuccessful())throw new IllegalStateException("UPSTREAM_FAILED");
                byte[] bytes=response.getBody().readNBytes(1024*1024+1);if(bytes.length>1024*1024)throw new IllegalStateException("RESPONSE_TOO_LARGE");
                return new ObjectMapper().readTree(bytes);
            });
            if(data==null||!data.isObject())throw new IllegalStateException("INVALID_RESPONSE");
            var reviews=new ArrayList<ReviewsPayload.Review>();
            for(var review:data.path("reviews")){
                var author=review.path("authorAttribution");String name=author.path("displayName").asText("");int rating=review.path("rating").asInt();
                if(name.isBlank()||rating<1||rating>5)continue;
                String date=review.path("publishTime").asText("");try{Instant.parse(date);}catch(Exception invalid){date="";}
                reviews.add(new ReviewsPayload.Review(review.path("name").asText("review-"+reviews.size()),name,rating,review.path("text").path("text").asText(review.path("originalText").path("text").asText("")),date,false,url(author.path("photoUri").asText("")),url(author.path("uri").asText("")),url(review.path("googleMapsUri").asText(""))));
                if(reviews.size()==4)break;
            }
            var attributions=new ArrayList<ReviewsPayload.Attribution>();
            for(var entry:data.path("attributions"))attributions.add(new ReviewsPayload.Attribution(entry.path("provider").asText(""),url(entry.path("providerUri").asText(""))));
            return new ReviewsPayload("GOOGLE","ready",List.copyOf(reviews),List.copyOf(attributions));
        }catch(Exception failure){throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"REVIEWS_UNAVAILABLE","Reviews are temporarily unavailable.");}
        finally{inFlight.release();}
    }
    private synchronized boolean permit(){long now=System.currentTimeMillis();if(now-window>=60000){window=now;requests=0;}return ++requests<=10;}
    private static String url(String value){try{var uri=java.net.URI.create(value);return "https".equalsIgnoreCase(uri.getScheme())&&uri.getHost()!=null&&uri.getUserInfo()==null?uri.toString():"";}catch(Exception invalid){return "";}}
}
