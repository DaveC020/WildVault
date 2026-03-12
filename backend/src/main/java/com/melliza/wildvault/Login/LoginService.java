package com.melliza.wildvault.Login;

import com.melliza.wildvault.Register.RegisterEntity;
import com.melliza.wildvault.Register.RegisterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class LoginService {

    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public String authenticate(LoginDTO loginDTO) {
        System.out.println("[DEBUG] Attempting login for username: " + loginDTO.getUsername());
        
        Optional<RegisterEntity> userOptional = registerRepository.findByUsername(loginDTO.getUsername());
        
        if (userOptional.isPresent()) {
            RegisterEntity user = userOptional.get();
            System.out.println("[DEBUG] User found in database");
            System.out.println("[DEBUG] Stored password hash: " + user.getPassword());
            System.out.println("[DEBUG] Input password: " + loginDTO.getPassword());
            
            boolean passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), user.getPassword());
            System.out.println("[DEBUG] Password matches: " + passwordMatches);
            
            if (passwordMatches) {
                System.out.println("[DEBUG] Login successful");
                return "Login successful";
            }
        } else {
            System.out.println("[DEBUG] User not found in database");
        }
        
        System.out.println("[DEBUG] Login failed - invalid credentials");
        return "Invalid credentials";
    }
}
