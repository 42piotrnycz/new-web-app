package com.example.demo.config;

import com.example.demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;



@Configuration
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

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

