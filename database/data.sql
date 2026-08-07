-- Seed Data for MedVault

USE medvault_db;

-- Clear any existing records to prevent key violations
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE medical_records;
TRUNCATE TABLE appointments;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE medicines;
TRUNCATE TABLE patients;
TRUNCATE TABLE doctors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Note: Admin account seeded here to occupy ID 1
INSERT INTO users (name, email, password, role, enabled) VALUES ('System Administrator', 'admin@gmail.com', '$2a$10$G2I3PBwrt6EFkcWISwMC9uPCg57aFi0c1k3.ogTr21s/FOfsLayjG', 'ROLE_ADMIN', true);

-- 2. Seed Sample Users (Password is 'User@123' for all seeded users: $2a$10$953CnarmrrHSxgBBbPtOFeQs4Y.iJ9ElTPphiO2rpNTYupnqGI.se)
-- Insert Doctors
INSERT INTO users (name, email, password, role, enabled) VALUES
('Dr. Sarah Jenkins', 'sarah.jenkins@medvault.com', '$2a$10$953CnarmrrHSxgBBbPtOFeQs4Y.iJ9ElTPphiO2rpNTYupnqGI.se', 'ROLE_DOCTOR', true),
('Dr. Robert Chen', 'robert.chen@medvault.com', '$2a$10$953CnarmrrHSxgBBbPtOFeQs4Y.iJ9ElTPphiO2rpNTYupnqGI.se', 'ROLE_DOCTOR', true);

-- Insert Patients
INSERT INTO users (name, email, password, role, enabled) VALUES
('John Doe', 'john.doe@gmail.com', '$2a$10$953CnarmrrHSxgBBbPtOFeQs4Y.iJ9ElTPphiO2rpNTYupnqGI.se', 'ROLE_PATIENT', true),
('Jane Smith', 'jane.smith@gmail.com', '$2a$10$953CnarmrrHSxgBBbPtOFeQs4Y.iJ9ElTPphiO2rpNTYupnqGI.se', 'ROLE_PATIENT', true);

-- 3. Seed Doctor Profiles
INSERT INTO doctors (user_id, specialization, license_number, phone, department, bio) VALUES
(2, 'Cardiology', 'LIC-1002345', '+1-555-0199', 'Cardiovascular Medicine', 'Experienced cardiologist specializing in preventive heart health and diagnostic imaging.'),
(3, 'Pediatrics', 'LIC-1002346', '+1-555-0200', 'Pediatrics & Child Health', 'Dedicated pediatrician with over 10 years of experience in early childhood development and immunizations.');

-- 4. Seed Patient Profiles
INSERT INTO patients (user_id, date_of_birth, gender, phone, blood_group, address, emergency_contact, assigned_doctor_id) VALUES
(4, '1988-05-12', 'Male', '+1-555-0144', 'A+', '123 Maple Street, Springfield', 'Mary Doe (+1-555-0145)', 1),
(5, '1992-09-23', 'Female', '+1-555-0177', 'O-', '456 Oak Avenue, Metropolis', 'Richard Smith (+1-555-0178)', 2);

-- 5. Seed Vaccinations
INSERT INTO vaccinations (patient_id, vaccine_name, date_administered, administered_by, next_due_date) VALUES
(1, 'Influenza Vaccine', '2025-10-15', 'Dr. Sarah Jenkins', '2026-10-15'),
(1, 'COVID-19 Booster', '2025-06-20', 'Dr. Sarah Jenkins', NULL),
(2, 'MMR Vaccine', '2010-04-12', 'Dr. Robert Chen', NULL);

-- 6. Seed Initial Audit Logs
INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES
(NULL, 'SYSTEM_STARTUP', 'Application started. Default database loaded.', '127.0.0.1');
