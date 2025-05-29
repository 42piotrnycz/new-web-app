package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to provide convenient redirects to Swagger documentation
 */
@Controller
public class SwaggerRedirectController {

    @GetMapping("/api/doc")
    public String redirectToApiDoc() {
        return "redirect:/api/docs";
    }

    @GetMapping("/swagger")
    public String redirectToSwagger() {
        return "redirect:/api/docs";
    }
}
