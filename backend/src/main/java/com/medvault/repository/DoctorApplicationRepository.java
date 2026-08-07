package com.medvault.repository;

import com.medvault.entity.DoctorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorApplicationRepository extends JpaRepository<DoctorApplication, Long> {
    List<DoctorApplication> findByStatusOrderByCreatedAtDesc(String status);
    Optional<DoctorApplication> findByEmail(String email);
    long countByStatus(String status);
}
