package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public String adminPanel(Model model) {
        List<User> users = userRepository.findAll();
        long userCount = users.size();
        long reviewCount = reviewRepository.count();

        long activeUsers = userCount;

        var usersWithReviewCounts = users.stream()
                .map(user -> {
                    var reviewsCount = reviewRepository.findByUserID(user.getId()).size();
                    user.setReviewCount(reviewsCount);
                    return user;
                })
                .collect(Collectors.toList());

        model.addAttribute("users", usersWithReviewCounts);
        model.addAttribute("userCount", userCount);
        model.addAttribute("reviewCount", reviewCount);
        model.addAttribute("activeUsers", activeUsers);

        return "admin";
    }
}