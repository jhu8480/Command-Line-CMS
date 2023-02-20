SELECT roles.role_id as id, roles.title, department.department_id, department.department_name, roles.salary FROM roles JOIN department ON roles.department_id = department.department_id;

SELECT e.employee_id AS id, e.first_name, e.last_name, roles.title, department.department_name AS department, roles.salary, CONCAT(m.first_name, ' ', m.last_name) as manager FROM employee e JOIN roles ON e.role_id = roles.role_id JOIN department ON roles.department_id = department.department_id JOIN employee m ON e.manager_id = m.employee_id;

SELECT DISTINCT m.employee_id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e JOIN employee m ON e.manager_id = m.employee_id;