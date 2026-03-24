package com.freelance.auth.dto;

import com.freelance.auth.entity.Role;
import lombok.Data;

import java.util.List;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;

    private String organisation;
    private String bankDetails;
    private List<String> skills;
}
