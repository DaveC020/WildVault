package com.melliza.wildvault.Register;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public String registerUser(RegisterDTO registerDTO) {
        if (registerRepository.existsByUsername(registerDTO.getUsername())) {
            return "Username already exists";
        }
        if (registerRepository.existsByEmail(registerDTO.getEmail())) {
            return "Email already exists";
        }

        RegisterEntity user = new RegisterEntity();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        registerRepository.save(user);
        System.out.println("[DEBUG] User registered with username: " + registerDTO.getUsername());
        System.out.println("[DEBUG] Encoded password: " + user.getPassword());
        return "Registration successful";
    }
}
