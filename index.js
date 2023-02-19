
const inquirer = require('inquirer');
const cTable = require('console.table'); // console.log(cTable.getTable([]))

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
console.log('-------------CREATED BY: jhu8480-----------------');
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
      name: 'department'
    }
  ])

}