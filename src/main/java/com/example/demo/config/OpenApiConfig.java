package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("REviewer 2.0 API")
                                                .description("Comprehensive API documentation for REviewer 2.0 - A platform for sharing reviews of movies, TV series, games, and books")
                                                .version("2.0.0")
                                                .contact(new Contact()
                                                                .name("REviewer 2.0 Team")
                                                                .email("support@reviewer2.com"))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .servers(List.of(
                                                new Server()
                                                                .url("http://localhost:8080")
                                                                .description("Development server"),
                                                new Server()
                                                                .url("https://api.reviewer2.com")
                                                                .description("Production server")))
                                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                                .components(new Components()
                                                .addSecuritySchemes("bearerAuth",
                                                                new SecurityScheme()
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .description("JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"")));
        }
}