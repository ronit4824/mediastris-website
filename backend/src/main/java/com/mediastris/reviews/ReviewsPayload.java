package com.mediastris.reviews;
import java.util.List;
public record ReviewsPayload(String mode,String status,List<Review> reviews,List<Attribution> attributions) {
    public record Review(String id,String name,int rating,String text,String date,boolean demo,String avatarUrl,String authorUrl,String reviewUrl) {}
    public record Attribution(String name,String url) {}
    public static ReviewsPayload empty(String status){return new ReviewsPayload("GOOGLE",status,List.of(),List.of());}
}
