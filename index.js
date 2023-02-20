
const inquirer = require('inquirer');
const cTable = require('console.table');

const mysql = require('mysql2');
const db = require('mysql-promise')();

const dotenv = require('dotenv');
dotenv.config({path: `./config.env`});

const dbParams = {
  host: 'localhost',
  user: 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'company_db'
};
db.configure(dbParams, mysql);

const firstQuestion = [
  {
    type: 'list',
    message: 'What would you like to do?',
    name: 'todo',
    choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update Employee Role', 'Quit']
  }
];

console.log('-------------------------------------------------');
console.log('--------------COMMAND LINE CMS-------------------');
console.log('---------------VERSION: 1.0.0--------------------');
console.log('-------------CREATED BY: jhu8480🫰---------------');
console.log('-------------------------------------------------');

initCMS();


function initCMS() {
  const prompt = inquirer.createPromptModule();
  prompt(firstQuestion)
    .then(({todo}) => {
      if ( todo === 'View All Employees' || todo === 'View All Roles' || todo === 'View All Departments') {
        const choice = todo === 'View All Departments' ? 'department' : todo === 'View All Roles' ? 'roles' : 'employee';
        viewAll(choice);
      } 
      else if (todo === 'Add a Department') {
        addDepartment();
      }
      else if (todo === 'Add a Role') {
        addRole();
      }
      else if (todo === 'Add an Employee') {
        addEmployee();
      }
      else if (todo === 'Update Employee Role') {
        updateEmployeeRole();
      }
      else if (todo === 'Quit') {
        console.log('\n\n\n---------------------Bye bye 👋 See you soon!---------------\n\n\n');
        process.exit(1);
      }
    });
}

async function viewAll(table) {
  try {
    let queryString;
    switch (table) {
      case 'department':
        queryString = 'SELECT * FROM department';
        break;
      case 'roles':
        queryString = 'SELECT roles.role_id as id, roles.title, department.department_id, department.department_name, roles.salary FROM roles JOIN department ON roles.department_id = department.department_id';
        break;
      case 'employee':
        queryString = `SELECT e.employee_id AS id, e.first_name, e.last_name, roles.title, department.department_name AS department, roles.salary, CONCAT(m.first_name, ' ', m.last_name) as manager FROM employee e JOIN roles ON e.role_id = roles.role_id JOIN department ON roles.department_id = department.department_id JOIN employee m ON e.manager_id = m.employee_id`;
        break;
    }
    const data = await db.query(queryString);
    console.log(`\n\n-----------------------\n\n`);
    console.log(cTable.getTable(data[0]));
  } catch(e) {
    console.error(e);
    process.exit(1);
  } finally {
    initCMS();
  }
}

async function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter name of the new department',
      name: 'department'
    }
  ]).then(
    async ({department}) => {
    try {
      const queryString = `INSERT INTO department(department_name) VALUES(?)`;
      const response = await db.query(queryString, department);
      console.log(response);
      console.log(`\n\n----------New Department ${department} Added-------------\n\n`);
    } catch(e) {
      console.error(e);
      process.exit(1);
    } finally {
      initCMS();
    }
  })
}

async function addRole() {
  const getAllDepartments = 'SELECT department_name FROM department';
  const departmentsObjArr = await db.query(getAllDepartments);
  const allDepartments = [];
  for (let i = 0; i < departmentsObjArr[0].length; i++) {
    allDepartments.push(departmentsObjArr[0][i].department_name);
  }

  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the name of the new role?',
      name: 'role'
    },
    {
      type: 'input',
      message: 'What is the salary of the new role?',
      name: 'salary'
    }, {
      type: 'list',
      message: 'Please pick the department the new role belongs to',
      name: 'department',
      choices: allDepartments
    }
  ]).then(async ({role: roleName, salary, department}) => {
    try {
      const getDepartmentId = await db.query(`SELECT department_id FROM department WHERE department_name = ?`, department);
      const queryString = 'INSERT INTO roles(title, salary, department_id) VALUES (?, ?, ?)';
      const response = await db.query(queryString, [roleName, salary, getDepartmentId[0].department_id]);
      console.log(response);
      console.log(`\n\n---------${roleName} has been added to roles!--------------\n\n`);
    } catch(e) {
      console.error(e);
      process.exit(1);
    } finally {
      initCMS();
    }
  })
}

async function addEmployee() {
  const getAllRoles = 'SELECT * FROM roles';
  const rolesObjArr = await db.query(getAllRoles);
  const allRoles = [];
  for (let i = 0; i < rolesObjArr[0].length; i++) {
    allRoles.push(rolesObjArr[0][i].title);
  }

  const getAllManagers = `SELECT DISTINCT CONCAT(m.first_name, ' ', m.last_name) AS manager_name, m.employee_id FROM employee e JOIN employee m ON e.manager_id = m.employee_id`;
  const managersObjArr = await db.query(getAllManagers);
  const allManagers = [];
  const managerNameList = [];
  for (let i = 0; i < managersObjArr[0].length; i++) {
    allManagers.push(managersObjArr[0][i]);
    managerNameList.push(managersObjArr[0][i].manager_name);
  }

  inquirer.prompt([
    {
      type: 'input',
      message: `What is the employee's first name?`,
      name: 'firstName'
    },
    {
      type: 'input',
      message: `What is the employee's last name?`,
      name: 'lastName'
    },
    {
      type: 'list',
      message: `What is the employee's role?`,
      name: 'employeeRole',
      choices: allRoles
    },
    {
      type: 'list',
      message: `Who is the employee's manager?`,
      name: 'employeeManager',
      choices: managerNameList
    }    
  ]).then(async ({firstName, lastName, employeeRole, employeeManager}) => {
      try {
        let roleId;
      for (let i = 0; i < rolesObjArr[0].length; i++) {
        if (employeeRole === rolesObjArr[0][i].title) {
          roleId = rolesObjArr[0][i].role_id;
        }
      }
      let managerId;
      for (let i =0; i < managersObjArr[0].length; i++) {
        if (employeeManager === managersObjArr[0][i].manager_name) {
          managerId = managersObjArr[0][i].employee_id;
        }
      }

      const queryString = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
      const response = db.query(queryString, [firstName, lastName, roleId, managerId]);
      console.log(response);
      console.log(`\n\n---------New Employee ${firstName} ${lastName} Added!--------------\n\n`);
      } catch(e) {
        console.error(e);
        process.exit(1);
      } finally {
        initCMS();
      }
  });
}

async function updateEmployeeRole() {
  const getEmployeeNames = `SELECT CONCAT(first_name, ' ',last_name) AS name FROM employee`;
  const empObjArr = await db.query(getEmployeeNames);
  const nameList = [];
  for (let i =0; i < empObjArr[0].length; i++) {
    nameList.push(empObjArr[0][i].name);
  }
  
  const getAllRoles = `SELECT * FROM roles`;
  const rolesObjArr = await db.query(getAllRoles);
  const titleList = [];
  for (let i = 0; i < rolesObjArr[0].length; i++) {
    titleList.push(rolesObjArr[0][i].title);
  }
  
  inquirer.prompt([
    {
      type: 'list',
      message: `Which employee's role do you want to update?`,
      name: 'emp_to_update',
      choices: nameList
    }, {
      type: 'list',
      message: `Which role do you want to assign the selected employee?`,
      name: 'new_role',
      choices: titleList
    }
  ]).then(async ({emp_to_update, new_role}) => {
      
  });
}
