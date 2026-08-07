package com.medvault.repository;

import com.medvault.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);
    List<MedicalRecord> findByPatientIdAndCategoryOrderByRecordDateDesc(Long patientId, String category);
    
    @Query("SELECT r FROM MedicalRecord r WHERE r.patient.id = :patientId AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<MedicalRecord> searchPatientRecords(@Param("patientId") Long patientId, @Param("query") String query);
}
