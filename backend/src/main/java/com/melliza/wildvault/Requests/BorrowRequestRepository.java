package com.melliza.wildvault.Requests;

import com.melliza.wildvault.Items.ItemEntity;
import com.melliza.wildvault.Register.RegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequestEntity, Long> {
    boolean existsByItemAndBorrowerAndStatus(ItemEntity item, RegisterEntity borrower, String status);
    long countByBorrowerAndStatus(RegisterEntity borrower, String status);
    long countByStatusAndDueDateBefore(String status, LocalDate date);
    List<BorrowRequestEntity> findByItem_OwnerAndStatusOrderByRequestDateDesc(RegisterEntity owner, String status);
    List<BorrowRequestEntity> findByItem_OwnerOrderByRequestDateDesc(RegisterEntity owner);
    List<BorrowRequestEntity> findByBorrowerOrderByRequestDateDesc(RegisterEntity borrower);
    List<BorrowRequestEntity> findByBorrowerAndStatusAndDueDateBetween(RegisterEntity borrower, String status, LocalDate start, LocalDate end);
    List<BorrowRequestEntity> findByItem_OwnerAndStatusAndDueDateBetween(RegisterEntity owner, String status, LocalDate start, LocalDate end);
    List<BorrowRequestEntity> findByIdIn(Collection<Long> ids);
}
