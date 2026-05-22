package com.melliza.wildvault.Items;

import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    List<ItemEntity> findByOwnerOrderByCreatedAtDesc(RegisterEntity owner);
    long countByOwner(RegisterEntity owner);
    long countByAvailable(boolean available);

    @Query("SELECT i FROM ItemEntity i LEFT JOIN i.owner o WHERE "
            + "(:search IS NULL OR :search = '' OR LOWER(i.name) LIKE CONCAT('%', :search, '%') "
            + "OR LOWER(i.description) LIKE CONCAT('%', :search, '%') "
            + "OR LOWER(i.category) LIKE CONCAT('%', :search, '%') "
            + "OR LOWER(CONCAT(COALESCE(o.firstName, ''), ' ', COALESCE(o.lastName, ''))) LIKE CONCAT('%', :search, '%') "
            + "OR LOWER(o.username) LIKE CONCAT('%', :search, '%')) "
            + "AND (:category IS NULL OR :category = '' OR LOWER(:category) = 'all categories' OR LOWER(i.category) LIKE CONCAT('%', :category, '%')) "
            + "AND (:status IS NULL OR :status = '' OR LOWER(:status) = 'all' "
            + "OR (:status = 'available' AND i.available = true) "
            + "OR (:status = 'borrowed' AND i.available = false))")
    Page<ItemEntity> findFiltered(@Param("search") String search,
                                  @Param("category") String category,
                                  @Param("status") String status,
                                  Pageable pageable);
}
