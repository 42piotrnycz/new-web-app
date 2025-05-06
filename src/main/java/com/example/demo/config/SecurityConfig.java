package com.example.demo.config;

import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.security.JwtFilter;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // Wyłączenie CSRF dla celów testowych
                .authorizeRequests(auth -> auth
                        .antMatchers("/api/auth/**", "/register", "/login", "/css/**", "/js/**", "/images/**").permitAll()  // Zezwalaj na dostęp do logowania i rejestracji
                        .antMatchers("/admin/**").hasRole("ADMIN")  // Tylko admini mogą odwiedzać "/admin/**"
                        .anyRequest().authenticated()  // Wymaga autentykacji dla pozostałych żądań
                )
                .addFilterBefore(new JwtFilter(jwtUtil, userDetailsService), UsernamePasswordAuthenticationFilter.class);  // Dodanie filtra JWT

        return http.build();
    }
}
