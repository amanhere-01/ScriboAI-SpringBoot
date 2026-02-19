package com.example.scriboai;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Base64;

@SpringBootApplication
public class ScriboAiApplication {

    public static void main(String[] args) {
        System.out.println(
                java.util.Base64.getEncoder().encodeToString(
                        Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded()
                )
        );
        SpringApplication.run(ScriboAiApplication.class, args);
    }

}
