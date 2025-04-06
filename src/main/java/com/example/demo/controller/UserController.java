package com.example.demo.controller;

import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import org.springframework.ui.Model;

import java.security.Principal;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRestController userRestController;

    @GetMapping("/register")
    public String showRegisterForm() {
        return "register";
    }

    @PostMapping("/register")
    public String processRegistration(@RequestParam String username,
                                      @RequestParam String password,
                                      @RequestParam String email,
                                      Model model) {
        boolean success = userService.registerUser(username, password, email);
        if (!success) {
            model.addAttribute("error", "Użytkownik o podanym loginie już istnieje.");
            return "register";
        }
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    @GetMapping("/profile")
    public String redirectToOwnProfile(Principal principal, @RequestParam(required = false) Long id) {
        Long userId = userService.getUserIdByUsername(principal.getName());

        if (id == null || !id.equals(userId)) {
            return "redirect:/profile?id=" + userId;
        }

        return "profile";
    }




    @GetMapping("/profile-view")
    public String showProfilePage() {
        return "profile"; // to profile.html
    }


}
