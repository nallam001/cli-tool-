#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import { randomUUID } from 'crypto';

const program = new Command();
const filePath = './courses.json';

// helper function to read courses
function readCourses() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// helper function to save courses
function saveCourses(courses) {
  fs.writeFileSync(filePath, JSON.stringify(courses, null, 2), 'utf8');
}

program
  .name('course-manager')
  .description('CLI to manage courses')
  .version('1.0.0');

// add
program
  .command('add')
  .alias('a')
  .description('Add a course')
  .action(() => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Course title:',
      },
      {
        type: 'number',
        name: 'price',
        message: 'Course price:',
      }
    ]).then((answers) => {
      const courses = readCourses();
      const newCourse = { id: randomUUID(), ...answers };
      courses.push(newCourse);
      saveCourses(courses);
      console.log('Course added successfully');
      console.table([newCourse]);
    });
  });

// list
program
  .command('list')
  .alias('l')
  .description('List all courses')
  .action(() => {
    const courses = readCourses();
    if (courses.length === 0) {
      console.log('No courses found');
    } else {
      console.table(courses);
    }
  });

// get
program
  .command('get')
  .alias('g')
  .description('Get a course by ID')
  .action(() => {
    const courses = readCourses();
    if (courses.length === 0) {
      console.log('No courses found');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter course ID:',
      }
    ]).then(({ id }) => {
      const course = courses.find(c => c.id === id);
      if (course) {
        console.table([course]);
      } else {
        console.log('Course not found with ID:', id);
      }
    });
  });

// update
program
  .command('update')
  .alias('u')
  .description('Update a course by ID')
  .action(() => {
    const courses = readCourses();
    if (courses.length === 0) {
      console.log('No courses found');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter course ID to update:',
      }
    ]).then(({ id }) => {
      const index = courses.findIndex(c => c.id === id);
      if (index === -1) {
        console.log('Course not found with ID:', id);
        return;
      }

      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'New title (leave empty to keep old):',
          default: courses[index].title
        },
        {
          type: 'number',
          name: 'price',
          message: 'New price (leave empty to keep old):',
          default: courses[index].price
        }
      ]).then((answers) => {
        courses[index] = { ...courses[index], ...answers };
        saveCourses(courses);
        console.log('Course updated successfully');
        console.table([courses[index]]);
      });
    });
  });

// delete
program
  .command('delete')
  .alias('d')
  .description('Delete a course by ID')
  .action(() => {
    const courses = readCourses();
    if (courses.length === 0) {
      console.log('No courses found');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter course ID to delete:',
      }
    ]).then(({ id }) => {
      const newCourses = courses.filter(c => c.id !== id);
      if (newCourses.length === courses.length) {
        console.log('Course not found with ID:', id);
        return;
      }
      saveCourses(newCourses);
      console.log('Course deleted successfully');
    });
  });

program.parse(process.argv);

