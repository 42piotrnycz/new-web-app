package com.example.demo.dto;

import com.example.demo.model.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {
    
    @Schema(description = "Role to assign to the user", example = "ROLE_ADMIN", 
            allowableValues = {"ROLE_USER", "ROLE_ADMIN"}, required = true)
    private String role;
}
