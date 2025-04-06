package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean registerUser(String username, String password, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            return false;
        }

        User user = new User(username, passwordEncoder.encode(password), email);
        userRepository.save(user);
        return true;
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username).map(User::getId).orElse(null);
    }

}
