
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
      else if (todo === 'Quit') {
        console.log('\n\n\n---------------------Bye bye 👋 See you soon!---------------\n\n\n');
        process.exit(1);
      }
    });
}

async function viewAll(table) {
  try {
    const queryString = `SELECT * FROM ${table}`;
    const data = await db.query(queryString);
    console.log(`\n\n-----------------------\n\n`);
    console.log(cTable.getTable(data[0]));
  } catch(e) {
    console.error(e);
  } finally {
    initCMS();
  }
}

async function addDepartment() {
  
}