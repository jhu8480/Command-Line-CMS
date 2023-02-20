DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;
USE company_db;

CREATE TABLE department (
  department_id INT AUTO_INCREMENT,
  department_name VARCHAR(30),
  PRIMARY KEY(department_id)
);

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL(3, 2),
  department_id INT,
  PRIMARY KEY(role_id),
  FOREIGN KEY(department_id)
  REFERENCES department(department_id)
  ON DELETE SET NULL
);

CREATE TABLE employee (
  employee_id INT AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  manager_id INT,
  PRIMARY KEY(employee_id),
  FOREIGN KEY(role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
  FOREIGN KEY(manager_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);


