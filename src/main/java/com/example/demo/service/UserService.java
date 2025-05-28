package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean registerUser(String username, String password, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            return false;
        }

        var user = new User(username, passwordEncoder.encode(password), email);
        user.setRole(User.Role.ROLE_USER);
        userRepository.save(user);
        return true;
    }

    public Integer getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .map(User::getUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
