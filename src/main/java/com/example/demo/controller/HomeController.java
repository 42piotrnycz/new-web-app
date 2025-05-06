package com.example.demo.controller;

import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class HomeController {
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/home")
    public String homePage(Model model, Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> {
                    model.addAttribute("user", user);
                    return "home";
                })
                .orElse("login");
    }
}
