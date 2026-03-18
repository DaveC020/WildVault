package com.melliza.wildvault.Register;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    private final RegisterRepository registerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public RegisterService(RegisterRepository registerRepository, BCryptPasswordEncoder passwordEncoder) {
        this.registerRepository = registerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerUser(RegisterDTO registerDTO) {
        String fullName = registerDTO.getFullName() == null ? "" : registerDTO.getFullName().trim();
        if (fullName.isBlank()) {
            return "Full name is required";
        }

        String displayName = registerDTO.getDisplayName() == null ? "" : registerDTO.getDisplayName().trim();
        if (displayName.isBlank()) {
            return "Display name is required";
        }

        String studentId = registerDTO.getStudentId() == null ? "" : registerDTO.getStudentId().trim();
        if (studentId.isBlank()) {
            return "Student ID is required";
        }

        if (registerRepository.existsByUsername(registerDTO.getUsername())) {
            return "Username already exists";
        }
        if (registerRepository.existsByEmail(registerDTO.getEmail())) {
            return "Email already exists";
        }
        if (registerRepository.existsByStudentId(studentId)) {
            return "Student ID already exists";
        }

        RegisterEntity user = new RegisterEntity();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setStudentId(studentId);
        user.setFullName(fullName);
        user.setDisplayName(displayName);

        registerRepository.save(user);
        return "Registration successful";
    }
}
