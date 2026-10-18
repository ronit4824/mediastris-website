package com.mediastris.careers;
import java.net.*;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class CareersHttpTest {
    @LocalServerPort int port;
    private int post(String path,String address,byte[] body,String type)throws Exception{
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+path)).header("X-Forwarded-For",address).header("Content-Type",type).POST(HttpRequest.BodyPublishers.ofByteArray(body)).build(),HttpResponse.BodyHandlers.discarding()).statusCode();
    }
    @Test void decodedPathsAreLimitedPerTrustedProxyClient()throws Exception{
        for(int i=0;i<5;i++)assertThat(post("/api/%63areers/apply","203.0.113.20",new byte[0],"application/json")).isEqualTo(415);
        assertThat(post("/api/%63areers/apply","203.0.113.20",new byte[0],"application/json")).isEqualTo(429);
        assertThat(post("/api/careers/apply","203.0.113.21",new byte[0],"application/json")).isEqualTo(415);
    }
    @Test void matrixParametersCannotBypassGuard()throws Exception{
        for(String path:java.util.List.of("/api;x/careers/apply","/api/careers/apply;x"))assertThat(post(path,"203.0.113.22",new byte[0],"application/json")).isEqualTo(400);
    }
    @Test void servletRejectsFilesOverFiveMiB()throws Exception{
        var body=new java.io.ByteArrayOutputStream();
        body.write("--boundary\r\nContent-Disposition: form-data; name=\"resume\"; filename=\"resume.pdf\"\r\nContent-Type: application/pdf\r\n\r\n".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        body.write(new byte[5*1024*1024+1]);body.write("\r\n--boundary--\r\n".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        assertThat(post("/api/careers/apply","203.0.113.23",body.toByteArray(),"multipart/form-data; boundary=boundary")).isEqualTo(413);
    }
}
