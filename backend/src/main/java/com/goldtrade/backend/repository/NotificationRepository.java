package com.goldtrade.backend.repository;

import com.goldtrade.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipientId = :recipientId and n.section = :section and n.isRead = false")
    void markSectionRead(@Param("recipientId") String recipientId, @Param("section") String section);

    void deleteByRecipientId(String recipientId);
}
