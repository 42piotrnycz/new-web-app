package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

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
                                .externalDocs(new ExternalDocumentation()
                                                .description("REviewer 2.0 Documentation")
                                                .url("https://github.com/ZTPAI/docs"))
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
        
        @Bean
        public OpenApiCustomizer globalApiResponseCustomizer() {
            return openApi -> {
                openApi.getPaths().values().forEach(pathItem -> {
                    pathItem.readOperations().forEach(operation -> {
                        ApiResponses apiResponses = operation.getResponses();
                        
                        // Ensure apiResponses is not null and initialized
                        if (apiResponses == null) {
                            apiResponses = new ApiResponses();
                            operation.setResponses(apiResponses);
                        }
                        
                        // Add common response codes if they don't exist
                        if (!apiResponses.containsKey("401")) {
                            apiResponses.addApiResponse("401", new ApiResponse().description("Unauthorized: Authentication required or token expired"));
                        }
                        if (!apiResponses.containsKey("403")) {
                            apiResponses.addApiResponse("403", new ApiResponse().description("Forbidden: Insufficient permissions"));
                        }
                        if (!apiResponses.containsKey("404") && !operation.getOperationId().contains("create")) {
                            apiResponses.addApiResponse("404", new ApiResponse().description("Not Found: Resource not found"));
                        }
                        if (!apiResponses.containsKey("500")) {
                            apiResponses.addApiResponse("500", new ApiResponse().description("Internal Server Error: Something went wrong on the server"));
                        }
                        
                        // Sort responses by status code
                        Map<String, ApiResponse> sortedResponses = new TreeMap<>(apiResponses);
                        apiResponses.clear();
                        sortedResponses.forEach(apiResponses::addApiResponse);
                    });
                });
            };
        }
}