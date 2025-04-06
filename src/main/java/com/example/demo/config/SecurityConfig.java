package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/register", "/login", "/css/**", "/js/**", "/images/**").permitAll()  // Zezwalaj na dostęp do rejestracji, logowania i zasobów statycznych
                        .anyRequest().authenticated()  // Wymagaj autentykacji dla pozostałych żądań
                )
                .formLogin(form -> form
                        .loginPage("/login") // Strona logowania
                        .defaultSuccessUrl("/home", true) // Po pomyślnym zalogowaniu przekierowanie do strony home
                        .failureUrl("/login?error=true") // W przypadku nieudanej próby logowania
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")  // Przekierowanie po wylogowaniu
                        .permitAll()  // Zezwalaj na dostęp do wylogowania
                )
                .csrf(csrf -> csrf.disable());  // Wyłączenie CSRF dla celów testowych

        return http.build();
    }
}

