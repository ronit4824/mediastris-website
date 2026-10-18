package com.mediastris.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.time.*;
import java.util.*;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestGuard extends OncePerRequestFilter {
    private record Window(Instant start,int count) {}
    private final Map<String,Window> rates=new HashMap<>();
    private Instant globalStart=Instant.now(); private int globalCount;
    private static final int MAX_BYTES=24*1024;
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
        response.setHeader("X-Content-Type-Options","nosniff");response.setHeader("Referrer-Policy","strict-origin-when-cross-origin");response.setHeader("X-Frame-Options","DENY");response.setHeader("Cache-Control","no-store");
        if(!request.getRequestURI().equals("/api/contact") || !request.getMethod().equals("POST")){chain.doFilter(request,response);return;}
        if(!allow(request.getRemoteAddr())){response.setHeader("Retry-After","600");error(response,429,"RATE_LIMITED");return;}
        if(request.getContentLengthLong()>MAX_BYTES){error(response,413,"PAYLOAD_TOO_LARGE");return;}
        // Read at most the limit + 1, including chunked requests with no Content-Length.
        byte[] bytes=request.getInputStream().readNBytes(MAX_BYTES+1);
        if(bytes.length>MAX_BYTES){error(response,413,"PAYLOAD_TOO_LARGE");return;}
        chain.doFilter(new HttpServletRequestWrapper(request){
            @Override public ServletInputStream getInputStream(){var input=new ByteArrayInputStream(bytes);return new ServletInputStream(){public int read(){return input.read();}public boolean isFinished(){return input.available()==0;}public boolean isReady(){return true;}public void setReadListener(ReadListener listener){throw new UnsupportedOperationException();}};}
            @Override public BufferedReader getReader(){return new BufferedReader(new InputStreamReader(getInputStream(),java.nio.charset.StandardCharsets.UTF_8));}
        },response);
    }
    private synchronized boolean allow(String address){Instant now=Instant.now();rates.entrySet().removeIf(e->e.getValue().start.plusSeconds(600).isBefore(now));if(globalStart.plusSeconds(600).isBefore(now)){globalStart=now;globalCount=0;}if(++globalCount>300)return false;Window current=rates.get(address);if(current==null){if(rates.size()>=10000)return false;rates.put(address,new Window(now,1));return true;}rates.put(address,new Window(current.start,current.count+1));return current.count<8;}
    private void error(HttpServletResponse response,int status,String code)throws IOException{response.setStatus(status);response.setContentType("application/json");response.getWriter().write("{\"code\":\""+code+"\",\"message\":\"Request could not be accepted.\",\"fields\":{}}");}
}
