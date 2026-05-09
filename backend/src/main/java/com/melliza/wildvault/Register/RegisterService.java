package com.melliza.wildvault.Register;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class RegisterService {

    private final RegisterRepository registerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public RegisterService(RegisterRepository registerRepository, BCryptPasswordEncoder passwordEncoder) {
        this.registerRepository = registerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerUser(RegisterDTO registerDTO) {
        if (registerDTO == null) {
            return "Registration details are required";
        }

        String username = registerDTO.getUsername() == null ? "" : registerDTO.getUsername().trim();
        if (username.isBlank()) {
            return "Username is required";
        }

        String email = registerDTO.getEmail() == null ? "" : registerDTO.getEmail().trim().toLowerCase();
        if (email.isBlank()) {
            return "Email is required";
        }

        String password = registerDTO.getPassword() == null ? "" : registerDTO.getPassword();
        String passwordError = validatePassword(password);
        if (passwordError != null) {
            return passwordError;
        }

        String firstName = registerDTO.getFirstName() == null ? "" : registerDTO.getFirstName().trim();
        if (firstName.isBlank()) {
            return "First name is required";
        }

        String lastName = registerDTO.getLastName() == null ? "" : registerDTO.getLastName().trim();
        if (lastName.isBlank()) {
            return "Last name is required";
        }

        String studentId = registerDTO.getStudentId() == null ? "" : registerDTO.getStudentId().trim();
        if (studentId.isBlank()) {
            return "Student ID is required";
        }

        if (registerRepository.existsByUsername(username)) {
            return "Username already exists";
        }
        if (registerRepository.existsByEmail(email)) {
            return "Email already exists";
        }
        if (registerRepository.existsByStudentId(studentId)) {
            return "Student ID already exists";
        }

        RegisterEntity user = new RegisterEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setStudentId(studentId);
        user.setFirstName(firstName);
        user.setLastName(lastName);

        registerRepository.save(user);
        return "Registration successful";
    }

    private String validatePassword(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            return "Password must contain at least 1 uppercase letter";
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            return "Password must contain at least 1 lowercase letter";
        }
        if (!Pattern.compile("\\d").matcher(password).find()) {
            return "Password must contain at least 1 number";
        }
        if (!Pattern.compile("[^A-Za-z0-9]").matcher(password).find()) {
            return "Password must contain at least 1 special character";
        }
        return null;
    }
}
