package com.example.scriboai.security;

import com.example.scriboai.common.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/") && !path.equals("/api/auth/me")) {
            filterChain.doFilter(request, response);
            return;
        }


        final String token = extractTokenFromCookies(request);
        if(token == null){
            filterChain.doFilter(request, response);
            return;
        }

        try{
            Claims claims = jwtService.extractAllClaims(token);

            String userEmail = claims.getSubject();

            if(userEmail!=null && SecurityContextHolder.getContext().getAuthentication()==null){
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (userEmail.equals(userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            sendError(response, "TOKEN_EXPIRED", "Session expired. Please login again.");
            return;
        }
        catch (JwtException | IllegalArgumentException e){
             sendError(response, "INVALID_TOKEN", "Invalid auth token");
             return;
        }

        filterChain.doFilter(request, response);
    }


    private String extractTokenFromCookies(HttpServletRequest request){
        if(request.getCookies() == null) return null;

        for(Cookie cookie : request.getCookies()){
            if(cookie.getName().equals("token")) return cookie.getValue();
        }

        return null;
    }

    private void sendError(HttpServletResponse response,String code,String message) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        ObjectMapper mapper = new ObjectMapper();
        ErrorResponse error = new ErrorResponse(code, message);

        mapper.writeValue(response.getWriter(), error);
    }
}
