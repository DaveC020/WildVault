package com.melliza.wildvault.Register;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RegisterRepository extends JpaRepository<RegisterEntity, Long> {
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<RegisterEntity> findByUsername(String username);
}
