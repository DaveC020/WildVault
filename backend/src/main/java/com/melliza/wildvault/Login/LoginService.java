package com.melliza.wildvault.Login;

import com.melliza.wildvault.Register.RegisterEntity;
import com.melliza.wildvault.Register.RegisterRepository;
import com.melliza.wildvault.Shared.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class LoginService {

    private static final Logger logger = LoggerFactory.getLogger(LoginService.class);

    private final RegisterRepository registerRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginService(RegisterRepository registerRepository, BCryptPasswordEncoder passwordEncoder, JwtService jwtService) {
        this.registerRepository = registerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String authenticateAndGenerateToken(LoginDTO loginDTO) {
        logger.debug("Login attempt for username={}", loginDTO.getUsername());

        Optional<RegisterEntity> userOptional = registerRepository.findByUsername(loginDTO.getUsername());

        if (userOptional.isPresent()) {
            RegisterEntity user = userOptional.get();

            boolean passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), user.getPassword());
            logger.debug("Password validation result for username={}: {}", loginDTO.getUsername(), passwordMatches);

            if (passwordMatches) {
                logger.info("Login successful for username={}", loginDTO.getUsername());
                return jwtService.generateToken(user.getUsername());
            }
        }

        logger.warn("Login failed for username={}", loginDTO.getUsername());
        return null;
    }
}
