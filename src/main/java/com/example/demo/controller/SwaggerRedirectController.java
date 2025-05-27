package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to provide convenient redirects to Swagger documentation
 */
@Controller
public class SwaggerRedirectController {
    
    /**
     * Redirects /api/doc to the configured Swagger UI path
     */
    @GetMapping("/api/doc")
    public String redirectToApiDoc() {
        return "redirect:/api/docs";
    }
    
    /**
     * Redirects root path to Swagger UI for convenience
     */
    @GetMapping("/swagger")
    public String redirectToSwagger() {
        return "redirect:/api/docs";
    }
}
