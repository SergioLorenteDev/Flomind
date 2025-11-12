package com.medac.trello.api.model.repository;

import com.medac.trello.api.model.Subscription;
import com.medac.trello.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    boolean existsByUserAndIsActive(User user, boolean isActive);

    @Modifying
    @Query("UPDATE Subscription s SET s.isActive = false WHERE s.user.id = :userId AND s.isActive = true")
    void setInactiveByUserId(@Param("userId") Long userId);
}