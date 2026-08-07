# MedVault REST API Testing (Postman Guidelines)

To test the backend APIs, import the following routes in Postman. All private endpoints require the `Authorization` header with value `Bearer <your_jwt_token>`.

---

## 1. Authentication Module

### Login (Patient / Doctor / Admin)
- **POST** `http://localhost:8080/api/auth/login`
- **Request Body (JSON)**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "Admin@312",
    "role": "ROLE_ADMIN"
  }
  ```

### Register Patient
- **POST** `http://localhost:8080/api/auth/register`
- **Request Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@gmail.com",
    "password": "User@123",
    "dateOfBirth": "1994-08-10",
    "gender": "Female",
    "phone": "+1-555-0811",
    "bloodGroup": "O+",
    "address": "789 Pine Rd, Springfield",
    "emergencyContact": "John Doe (+1-555-0144)"
  }
  ```

---

## 2. Administrator Module (ROLE_ADMIN only)

### Get All Doctors
- **GET** `http://localhost:8080/api/admin/doctors?search=`

### Register Doctor
- **POST** `http://localhost:8080/api/admin/doctors`
- **Request Body (JSON)**:
  ```json
  {
    "name": "Dr. Alan Grant",
    "email": "alan.grant@medvault.com",
    "specialization": "Pediatric Cardiology",
    "licenseNumber": "LIC-9988223",
    "department": "Cardiology",
    "phone": "+1-555-0988",
    "bio": "Expert in pediatric cardiovascular defects."
  }
  ```

---

## 3. Medical Records Module (ROLE_DOCTOR or ROLE_PATIENT)

### Upload Record File (Multipart Form)
- **POST** `http://localhost:8080/api/records/1/upload` (for Doctors) or `http://localhost:8080/api/patient/records/1/upload` (for Patients)
- **Form Data**:
  - `file`: (Select PDF, PNG, or JPG file)
  - `testName`: "Chest X-Ray Diagnostic"
