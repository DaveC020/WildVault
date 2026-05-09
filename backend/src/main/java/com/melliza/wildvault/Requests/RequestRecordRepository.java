package com.melliza.wildvault.Requests;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface RequestRecordRepository extends JpaRepository<RequestRecordEntity, Long> {
    List<RequestRecordEntity> findTop50ByBorrowRequest_IdInOrderByPerformedAtDesc(Collection<Long> ids);
}
