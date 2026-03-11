-- ============================================================
-- QR Code Attendance System - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS qr_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_attendance;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid        VARCHAR(36)  NOT NULL UNIQUE,
  full_name   VARCHAR(120) NOT NULL,
  email       VARCHAR(180)          DEFAULT NULL,
  mobile      VARCHAR(20)           DEFAULT NULL,
  role        ENUM('user','admin')  NOT NULL DEFAULT 'user',
  password    VARCHAR(255)          DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_contact CHECK (email IS NOT NULL OR mobile IS NOT NULL),
  INDEX idx_email  (email),
  INDEX idx_mobile (mobile),
  INDEX idx_uuid   (uuid)
);

-- ============================================================
-- QR CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(64)  NOT NULL UNIQUE,
  qr_code_url TEXT         NOT NULL,
  expires_at  DATETIME              DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token   (token),
  INDEX idx_user_id (user_id)
);

-- ============================================================
-- ATTENDANCE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  scan_time   TIME         NOT NULL,
  scan_date   DATE         NOT NULL,
  ip_address  VARCHAR(45)           DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_date (user_id, scan_date),
  INDEX idx_scan_date (scan_date),
  INDEX idx_user_id   (user_id)
);

-- ============================================================
-- DEFAULT ADMIN USER  (password: Admin@1234)
-- ============================================================
INSERT INTO users (uuid, full_name, email, role, password) VALUES
  (UUID(), 'System Admin', 'admin@qrattend.local', 'admin',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- ⚠️  Change this password immediately in production!
