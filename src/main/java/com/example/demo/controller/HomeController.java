package com.example.demo.controller;

import com.example.demo.repository.UserRepository;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.Optional;

@Controller
public class HomeController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;


    @Autowired
    public HomeController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/home")
    public String homePage(Model model, Principal principal) {
        String username = principal.getName();  // Get the logged-in user's username

        // Ensure you're fetching your custom User from the database
        Optional<User> currentUser = userRepository.findByUsername(username);

        if (currentUser.isPresent()) {
            User user = currentUser.get();
            model.addAttribute("user", user);  // Add user to model for HTML template access
            // Redirect to the home page, where user ID is included
            return "home";
        }

        return "home";  // Return to home page if no user is found
    }
}
