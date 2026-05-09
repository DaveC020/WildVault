package com.melliza.wildvault.Items;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    List<ItemEntity> findByOwnerOrderByCreatedAtDesc(RegisterEntity owner);
    long countByOwner(RegisterEntity owner);
    long countByAvailable(boolean available);
}
