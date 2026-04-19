package com.example.scriboai.auth.service;

import com.example.scriboai.auth.dto.LoginRequest;
import com.example.scriboai.auth.dto.RegisterRequest;
import com.example.scriboai.auth.dto.UserResponse;
import com.example.scriboai.common.exception.EmailAlreadyExistsException;
import com.example.scriboai.common.exception.InvalidCredentialsException;
import com.example.scriboai.security.JwtService;
import com.example.scriboai.user.model.User;
import com.example.scriboai.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    // ---------------- REGISTER TESTS ----------------
    @Test
    public void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest("testUser", "test@gmail.com", "test123");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPass");

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password("encodedPass")
                .build();

        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        String token = authService.register(request);

        assertEquals("jwt-token", token);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowEmailAlreadyExistsException() {
        RegisterRequest request = new RegisterRequest("testUser", "test@gmail.com", "test123");

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () ->{
            authService.register(request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    // ---------------- LOGIN TESTS ----------------
    @Test
    public void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("test@gmail.com", "test123");

        User user = User.builder()
                .email("test@gmail.com")
                .password("encodedPass")
                .build();

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        String token = authService.login(request);

        assertEquals("jwt-token", token);
        verify(authenticationManager).authenticate(any());
        verify(userRepository).findByEmail("test@gmail.com");
    }

    @Test
    void shouldThrowException_whenInvalidCredentials() {
        LoginRequest request = new LoginRequest("test@gmail.com", "test123");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad Credentials"));

        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login(request);
        });
    }

    @Test
    void shouldThrowInvalidCredentials_whenUserNotFound() {
        LoginRequest request = new LoginRequest("test@gmail.com", "test123");

        User user = User.builder()
                .email("test@gmail.com")
                .password("encodedPass")
                .build();

        //Authentication passes
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () ->{
            authService.login(request);
        });
    }

    @Test
    void shouldReturnCurrentUser() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("test@gmail.com");

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = User.builder()
                .id(1L)
                .username("testUser")
                .email("test@gmail.com")
                .build();

        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser();

        assertEquals("testUser", response.username());
        assertEquals("test@gmail.com", response.email());
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldThrowException_whenCurrentUserIsUnauthorized(){
        // No authentication
        SecurityContextHolder.clearContext();

        assertThrows(RuntimeException.class, () -> {
            authService.getCurrentUser();
        });
    }

    @Test
    void shouldThrowException_whenCurrentUserNotFound(){
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("test@gmail.com");
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            authService.getCurrentUser();
        });
    }
}