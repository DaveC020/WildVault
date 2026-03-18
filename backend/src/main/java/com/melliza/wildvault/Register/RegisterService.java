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
        user.setFirstName(firstName);
        user.setLastName(lastName);

        registerRepository.save(user);
        return "Registration successful";
    }
}
