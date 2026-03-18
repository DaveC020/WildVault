package com.melliza.wildvault.EditPassword;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EditPswdRepository extends JpaRepository<RegisterEntity, Long> {
    Optional<RegisterEntity> findByUsername(String username);
}
