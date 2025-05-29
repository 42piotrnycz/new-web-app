package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

    public Authentication authenticateUser(String username, String password,
            AuthenticationManager authenticationManager) {
        return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                username, password));
    }

    @Transactional
    public boolean registerUser(String username, String password, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            return false;
        }
        var user = new User(username, passwordEncoder.encode(password), email);
        user.setRole(User.Role.ROLE_USER);
        User savedUser = userRepository.save(user);

        logService.logUserActivity(savedUser.getId(), "User registered");

        return true;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUserRole(Integer userId, String newRole, Principal adminPrincipal) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        String adminUsername = adminPrincipal.getName();
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + adminUsername));

        if (!"ROLE_ADMIN".equals(admin.getRole().toString())) {
            throw new AccessDeniedException("Only admins can update user roles");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(newRole);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }

        targetUser.setRole(role);
        User updatedUser = userRepository.save(targetUser);

        logService.logAdminActivity(admin.getId(),
                "Updated user " + targetUser.getUsername() + " role to " + newRole);

        return updatedUser;
    }

    @Transactional
    public User updateUserProfile(Integer userId, Map<String, String> updatedData, Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole().toString());
        if (!currentUser.getId().equals(userId) && !isAdmin) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        if (updatedData.containsKey("email")) {
            userToUpdate.setEmail(updatedData.get("email"));
        }

        if (updatedData.containsKey("password")) {
            userToUpdate.setPassword(passwordEncoder.encode(updatedData.get("password")));
        }

        User updatedUser = userRepository.save(userToUpdate);

        logService.logUserActivity(currentUser.getId(), "Updated profile information");

        if (isAdmin && !currentUser.getId().equals(userId)) {
            logService.logAdminActivity(currentUser.getId(),
                    "Admin updated user " + userToUpdate.getUsername() + " profile information");
        }

        return updatedUser;
    }

    @Transactional
    public void deleteUser(Integer userId, Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole().toString());
        if (!currentUser.getId().equals(userId) && !isAdmin) {
            throw new AccessDeniedException("You can only delete your own account");
        }

        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        if ("ROLE_ADMIN".equals(userToDelete.getRole().toString())) {
            long adminCount = userRepository.countByRole(User.Role.ROLE_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last admin user");
            }
        }

        userRepository.delete(userToDelete);

        if (isAdmin && !currentUser.getId().equals(userId)) {
            logService.logAdminActivity(currentUser.getId(),
                    "Admin deleted user " + userToDelete.getUsername());
        }
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

    public User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public void logoutUser(Principal principal, RefreshTokenService refreshTokenService, org.slf4j.Logger log) {
        if (principal != null) {
            User user = getUserByUsername(principal.getName()).orElse(null);
            if (user != null) {
                refreshTokenService.revokeAllUserTokens(user);
                log.info("Revoked refresh tokens for user: {}", principal.getName());
            }
        }
    }
}
