# MedVault – Secure Digital Medical Record Management System

MedVault is a modern, secure, and scalable healthcare web application that allows patients, doctors, and administrators to securely store and share digital medical histories, clinical records, scans, prescriptions, and appointment bookings.

## Project Structure
```
MedVault/
├── backend/          # Spring Boot 3 + Java 21 REST API
├── frontend/         # React.js + Vite + Tailwind CSS v4 Dashboards
├── database/         # MySQL 8 database schema & seed scripts
├── docs/             # Technical architecture details
└── README.md         # Setup and run guide
```

---

## Default Portals & Credentials

MedVault features three completely separate web portals using Role-Based Access Control (RBAC).

### 1. Admin Portal (`/admin/login`)
Admin accounts cannot be self-registered and are locked down to administrative IP regions.
- **Default Email**: `admin@gmail.com`
- **Default Password**: `Admin@312`
- **Default Role**: `ROLE_ADMIN`

### 2. Doctor Portal (`/doctor/login`)
Doctor profiles are created, edited, or disabled only by the Admin.
- **Sample Doctor Email**: `sarah.jenkins@medvault.com`
- **Password**: `User@123` 
- **Default Role**: `ROLE_DOCTOR`

### 3. Patient Portal (`/patient/login` or `/register` to self-register)
Patients can sign up publicly, manage details, and download prescription PDFs.
- **Sample Patient Email**: `john.doe@gmail.com`
- **Password**: `User@123`
- **Default Role**: `ROLE_PATIENT`

---

## Setup & Deployment Guide

### Prerequisites
- **Java SE Development Kit (JDK)**: Version 21
- **Apache Maven**: Version 3.9+
- **Node.js**: Version 20+ (with npm)
- **MySQL Database Server**: Version 8.x

---

### Step 1: Database Setup
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE medvault_db;
   ```
2. Run the schema creation and initial seeds:
   ```bash
   mysql -u root -p medvault_db < database/schema.sql
   mysql -u root -p medvault_db < database/data.sql
   ```
   *(Note: The Super Admin account is seeded automatically by the Spring Boot backend on startup to ensure proper BCrypt encryption strength).*

---

### Step 2: Backend Setup
1. Navigate to the `backend/` directory:
2. Open `src/main/resources/application.properties` and verify your local MySQL username and password:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
3. Build the backend using Maven:
   ```bash
   mvn clean package
   ```
4. Start the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on **`http://localhost:8080`**.
   - **Swagger UI API docs**: `http://localhost:8080/swagger-ui/index.html`
   - **REST API Entry Path**: `http://localhost:8080/api`

---

### Step 3: Frontend Setup
1. Navigate to the `frontend/` directory:
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will boot up at **`http://localhost:5173`**.

---

## Security Implementations
- **Stateless Authorization**: Secured via JSON Web Tokens (JWT).
- **Password Protection**: Salted and encrypted using Spring Security's `BCryptPasswordEncoder`.
- **IP Audit Logging**: Logs every database change, upload, registration, and login alongside client IP details.
- **File Upload Limits**: Restricted to 20MB maximum. Support for PDF, JPG, PNG, and JPEG documents.
- **Route Guards**: Enforced via React Router + JWT interceptors on the frontend, and Method Security (`@PreAuthorize`) in Spring controllers.
