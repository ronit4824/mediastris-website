package com.mediastris.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Semaphore;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component @Order(Ordered.HIGHEST_PRECEDENCE+1)
public class CareersRequestGuard extends OncePerRequestFilter {
    private record Window(Instant time,int count){}
    private final Map<String,Window> rates=new HashMap<>();private final Semaphore inFlight=new Semaphore(4);private Instant start=Instant.now();private int count;
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
        String raw=request.getRequestURI();String path=request.getServletPath();if(path==null||path.isEmpty())path=raw;
        if(raw.contains(";")||raw.toLowerCase(java.util.Locale.ROOT).contains("%3b")){error(response,400,"INVALID_PATH");return;}
        if(!path.startsWith("/api/careers/")||!request.getMethod().equals("POST")){chain.doFilter(request,response);return;}
        if(request.getContentLengthLong()>6*1024*1024){error(response,413,"PAYLOAD_TOO_LARGE");return;}
        if(!allow(request.getRemoteAddr())||!inFlight.tryAcquire()){response.setHeader("Retry-After","3600");error(response,429,"RATE_LIMITED");return;}
        try{chain.doFilter(request,response);}finally{inFlight.release();}
    }
    private synchronized boolean allow(String address){Instant now=Instant.now();rates.entrySet().removeIf(e->e.getValue().time.plusSeconds(3600).isBefore(now));if(start.plusSeconds(3600).isBefore(now)){start=now;count=0;}if(++count>60)return false;var current=rates.get(address);if(current==null){if(rates.size()>=10000)return false;rates.put(address,new Window(now,1));return true;}rates.put(address,new Window(current.time,current.count+1));return current.count<5;}
    private void error(HttpServletResponse response,int status,String code)throws IOException{response.setStatus(status);response.setContentType("application/json");response.getWriter().write("{\"code\":\""+code+"\",\"message\":\"Application could not be accepted.\",\"fields\":{}}");}
}
