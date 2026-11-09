-- SimuStudent Database Schema
-- MySQL 8.0+
-- Chay: mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS simustudent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE simustudent;

-- =============================================
-- USERS (dang nhap / dang ky)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,  -- bcrypt hash
  full_name    VARCHAR(100),
  mssv         VARCHAR(20),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SUBJECTS (mon hoc)
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  subject_code   VARCHAR(20) UNIQUE NOT NULL,
  name           VARCHAR(150) NOT NULL,
  credits        INT NOT NULL DEFAULT 3,
  difficulty     TINYINT NOT NULL DEFAULT 3 COMMENT '1=De, 5=Rat kho',
  category       ENUM('general','cs','dev','sys') DEFAULT 'cs',
  semester_avail VARCHAR(20) DEFAULT 'HK1,HK2'   COMMENT 'CSV: HK1,HK2,He'
);

-- =============================================
-- SIMULATIONS (trang thai tong the cua user)
-- =============================================
CREATE TABLE IF NOT EXISTS simulations (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  user_id                INT NOT NULL,
  current_year           INT DEFAULT 1,
  current_term           ENUM('HK1','HK2','He') DEFAULT 'HK1',
  total_credits_earned   INT DEFAULT 0,
  gpa                    DECIMAL(3,2) DEFAULT 0.00,
  health                 INT DEFAULT 100,
  stress                 INT DEFAULT 0,
  status                 ENUM('active','completed','dropped') DEFAULT 'active',
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- SIMULATION_SEMESTERS (lich su tung ky hoc)
-- =============================================
CREATE TABLE IF NOT EXISTS simulation_semesters (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  simulation_id        INT NOT NULL,
  year                 INT NOT NULL,
  term                 ENUM('HK1','HK2','He') NOT NULL,
  registered_credits   INT DEFAULT 0,
  passed_credits       INT DEFAULT 0,
  term_gpa             DECIMAL(3,2) DEFAULT 0.00,
  health_end           INT DEFAULT 100,
  stress_end           INT DEFAULT 0,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- =============================================
-- SEMESTER_COURSES (diem tung mon trong tung ky)
-- =============================================
CREATE TABLE IF NOT EXISTS semester_courses (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  semester_id          INT NOT NULL,
  subject_id           INT NOT NULL,
  study_hours_alloc    INT DEFAULT 0,
  midterm_score        DECIMAL(4,2) DEFAULT 0.00,
  final_score          DECIMAL(4,2) DEFAULT 0.00,
  course_gpa           DECIMAL(3,2) DEFAULT 0.00,
  letter_grade         VARCHAR(3),
  is_passed            BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (semester_id) REFERENCES simulation_semesters(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)  REFERENCES subjects(id)
);

-- =============================================
-- SAMPLE DATA: Subjects
-- =============================================
INSERT INTO subjects (subject_code, name, credits, difficulty, category, semester_avail) VALUES
-- Dai cuong
('TOAN001', 'Toan cao cap A1',                    3, 2, 'general', 'HK1'),
('TOAN002', 'Toan cao cap A2',                    3, 3, 'general', 'HK2'),
('VLY001',  'Vat ly dai cuong',                   3, 2, 'general', 'HK1,HK2'),
('ANH001',  'Tieng Anh co ban 1',                 3, 1, 'general', 'HK1'),
('ANH002',  'Tieng Anh co ban 2',                 3, 2, 'general', 'HK2'),
('GDCT001', 'Chinh tri hoc',                      2, 1, 'general', 'HK1,HK2'),
('TOAN003', 'Xac suat thong ke',                  3, 3, 'general', 'HK1,HK2'),
('MATH004', 'Toan roi rac',                       3, 4, 'general', 'HK1,HK2'),
-- Co so nganh
('CNTT001', 'Nhap mon cong nghe thong tin',        3, 1, 'cs', 'HK1'),
('CNTT002', 'Kien truc may tinh',                 3, 3, 'cs', 'HK1,HK2'),
('CNTT003', 'He dieu hanh',                       3, 4, 'cs', 'HK1,HK2'),
('CNTT004', 'Mang may tinh',                      3, 4, 'cs', 'HK1,HK2'),
('CNTT005', 'Cau truc du lieu va giai thuat',     3, 5, 'cs', 'HK1,HK2'),
('CNTT006', 'Co so du lieu',                      3, 3, 'cs', 'HK1,HK2,He'),
('CNTT010', 'Phan tich va thiet ke he thong',     3, 3, 'cs', 'HK1,HK2'),
-- Lap trinh
('LT001',   'Lap trinh C co ban',                 3, 2, 'dev', 'HK1'),
('LT002',   'Lap trinh huong doi tuong',          3, 3, 'dev', 'HK1,HK2'),
('LT003',   'Lap trinh web',                      3, 3, 'dev', 'HK1,HK2,He'),
('LT004',   'Lap trinh di dong',                  3, 4, 'dev', 'HK2,He'),
('LT005',   'Lap trinh Python',                   3, 2, 'dev', 'HK1,HK2,He'),
('LT006',   'Phat trien ung dung Java',           3, 4, 'dev', 'HK2'),
('LT007',   'Lap trinh Node.js',                  3, 3, 'dev', 'HK2,He'),
('LT008',   'Lap trinh React',                    3, 4, 'dev', 'HK2,He'),
-- He thong
('SYS001',  'Dien toan dam may',                  3, 4, 'sys', 'HK2,He'),
('SYS002',  'Quan tri co so du lieu',             3, 3, 'sys', 'HK1,HK2'),
('SYS004',  'Kiem thu phan mem',                  3, 3, 'sys', 'HK1,HK2,He'),
('SYS005',  'Cong nghe phan mem',                 3, 4, 'sys', 'HK1,HK2');