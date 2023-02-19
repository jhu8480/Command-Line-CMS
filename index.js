
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
    choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
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
      if ( todo === 'View All Employees') {
        viewAllEmployees();
      } else if (todo === 'View All Departments') {
        viewAllDepartments();
      } else if (todo === 'Quit') {
        console.log('---------------------Bye bye 👋 See you soon!---------------');
        process.exit(1);
      }
    });
}

async function viewAllEmployees() {
  const queryString = 'SELECT * FROM employee';
  const data = await db.query(queryString);
  console.log(`\n\n-----------------------`);
  console.log(cTable.getTable(data[0]));
  initCMS();
}

async function viewAllDepartments() {
  const queryString = 'SELECT * FROM department';
  const data = await db.query(queryString);
  console.log(`\n\n-----------------------`);
  console.log(cTable.getTable(data[0]));
  initCMS();
}