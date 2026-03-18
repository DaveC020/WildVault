package com.melliza.wildvault.EditProfile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melliza.wildvault.Profile.ProfileEntity;
import java.util.Optional;

@Repository
public interface EditProfileRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByUsername(String username);
    Optional<ProfileEntity> findByEmail(String email);
}
