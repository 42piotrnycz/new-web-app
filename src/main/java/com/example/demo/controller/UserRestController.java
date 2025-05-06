package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRestController {
    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok().body((Object) user))
                .orElse(ResponseEntity.status(404)
                        .body(Map.of("error", "Użytkownik o ID " + id + " nie został znaleziony")));
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> ResponseEntity.ok().body((Object) user))
                .orElse(ResponseEntity.status(404)
                        .body(Map.of("error", "Nie znaleziono użytkownika")));
    }
}
