package com.mediastris.careers;
import com.mediastris.reviews.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.http.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.assertj.core.api.Assertions.*;
class GoogleReviewsTest {
 @Test void unconfiguredNeverReturnsSamples(){
  var service=new GoogleReviewsService(RestClient.builder(),"","");
  assertThat(service.load().status()).isEqualTo("unconfigured");assertThat(service.load().reviews()).isEmpty();
 }
 @Test void googleFieldsAndAuthorshipArePreserved(){
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
  server.expect(requestTo("https://places.googleapis.com/v1/places/verified-test-id")).andExpect(header("X-Goog-Api-Key","test-key")).andExpect(header("X-Goog-FieldMask","reviews,attributions"))
   .andRespond(withSuccess("""
   {"reviews":[{"name":"places/x/reviews/a","rating":4,"text":{"text":"Synthetic upstream response, not a live review."},"publishTime":"2026-01-01T00:00:00Z","authorAttribution":{"displayName":"Synthetic API Author","uri":"https://www.google.com/maps/contrib/123","photoUri":"https://example.test/photo.jpg"},"googleMapsUri":"https://www.google.com/maps/reviews/123"}],"attributions":[{"provider":"Synthetic provider","providerUri":"https://example.test"}]}
   """,MediaType.APPLICATION_JSON));
  var result=new GoogleReviewsService(builder.baseUrl("https://places.googleapis.com").build(),"verified-test-id","test-key").load();
  assertThat(result.mode()).isEqualTo("GOOGLE");assertThat(result.reviews()).hasSize(1);assertThat(result.reviews().getFirst().demo()).isFalse();assertThat(result.reviews().getFirst().name()).isEqualTo("Synthetic API Author");assertThat(result.attributions().getFirst().name()).isEqualTo("Synthetic provider");server.verify();
 }
 @Test void providerFailureIsSafeAndNeverReplacedWithDemo(){
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
  server.expect(anything()).andRespond(withStatus(HttpStatus.FORBIDDEN).body("secret-provider-error"));
  assertThatThrownBy(()->new GoogleReviewsService(builder.baseUrl("https://places.googleapis.com").build(),"test-place","test-key").load()).isInstanceOf(com.mediastris.contact.ApiException.class).hasMessage("Reviews are temporarily unavailable.");server.verify();
 }
 @Test void invalidPlaceIdNeverReachesNetwork(){
  assertThat(new GoogleReviewsService(RestClient.builder(),"../other?key=bad","test-key").load().reviews()).isEmpty();
 }
}
