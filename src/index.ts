import { TodoCollection } from "./todoCollection.js";
import inquirer from 'inquirer';
import { JsonTodoCollection } from "./jsonTodoCollection.js";
import { JsonUsers } from "./jsonUsers.js";
import { Users } from "./users.js";

const users: Users = new JsonUsers();

let currentCollection: TodoCollection;
let showCompleted: boolean = true;

function displayTodoList(): void {
  console.log(`${currentCollection.userName[0].toUpperCase()
    + currentCollection.userName.slice(1)}'s Todo List `
    + `(${currentCollection.getItemCounts().incomplete} items to do)`);
  currentCollection.getTodoItems(showCompleted).forEach((item) => item.printDetails());
}

enum UserPromptCommands {
  Complete = 'Complete Task',
  Add = 'Add New Task',
  Toggle = 'Show/Hide Completed',
  Purge = 'Remove Completed Tasks',
  Quit = 'Quit',
}

enum ChoosingUserCommands {
  Create = 'Create New User',
  Delete = 'Remove Users',
  Quit = 'Quit',
}

function promptAdd(): void {
  console.clear();
  inquirer.prompt({ type: 'input', name: 'add', message: 'Enter task:'})
    .then((answers) => {
      if (answers.add.trim() !== '') {
        currentCollection.addTodo(answers.add);
      }
      promptUser();
    })
}

function propmptComplete(): void {
  console.clear();
  inquirer.prompt({
    type: 'checkbox',
    name: 'complete',
    message: 'Mark Tasks Complete',
    choices: currentCollection.getTodoItems(showCompleted)
        .map((item) => ({ name: item.task, value: item.id, checked: item.complete })),
    }).then((answers) => {
      const completedTasks = answers.complete as number[];
      currentCollection.getTodoItems(true).forEach((item) => {
        currentCollection.markComplete(item.id,
          completedTasks.find((id) => id === item.id) !== undefined);
      });
      promptUser();
    });
}

function promptUser(): void {
  console.clear();
  displayTodoList();
  inquirer.prompt({
    type: 'list',
    name: 'command',
    message: 'Choose option',
    choices: Object.values(UserPromptCommands),
  }).then((answers) => {
      switch (answers.command) {
        case UserPromptCommands.Toggle:
          showCompleted = !showCompleted;
          promptUser();
          break;
        case UserPromptCommands.Add:
          promptAdd();
          break;
        case UserPromptCommands.Complete:
          if (currentCollection.getItemCounts().incomplete > 0) {
            propmptComplete();
          } else {
            promptUser();
          }
          break;
        case UserPromptCommands.Purge:
          currentCollection.removeComplete();
          promptUser();
          break;
      }
  })
}

function promptUsername(isError?: boolean): void {
  console.clear();
  if (isError) {
    console.log('You entered an empty username\nor this username already exists');
  }
  inquirer.prompt({ type: 'input', name: 'username', message: 'Enter your username to create personal Todo List:'})
  .then((answers) => {
    if (answers.username.trim() !== '' && !users.hasUser(answers.username)) {
      users.addUser(answers.username.trim().toLowerCase());
      currentCollection = new JsonTodoCollection(answers.username.trim().toLowerCase());
      promptUser();
    } else {
      promptUsername(true);
    }
  })
}

function promptDelete(): void {
  console.clear();
  inquirer.prompt({
    type: 'checkbox',
    name: 'delete',
    message: 'Choose Users To Delete',
    choices: users.getUsers()
        .map((user) => ({ name: user.username, value: user.id, checked: false })),
    }).then((answers) => {
      const IdsToDelete = answers.delete as number[];
      IdsToDelete.forEach((id) => {
        const username = users.deleteUser(id);
        users.deleteUserDatabase(username);
      });
      promptChoosingUser();
    });
}

function promptChoosingUser(): void {
  console.clear();
  if (users.getUsersCount() === 0) {
    promptUsername();
  } else {
    console.clear();
    inquirer.prompt({
      type: 'list',
      name: 'user',
      message: 'Choose your username',
      choices: [...users.getUsernames(), ...Object.values(ChoosingUserCommands)],
    }).then((answers) => {
      if (answers.user === ChoosingUserCommands.Create) {
        promptUsername();
      }

      if (answers.user === ChoosingUserCommands.Delete) {
        promptDelete();
      }

      if ([...users.getUsernames()].includes(answers.user)) {
        currentCollection = new JsonTodoCollection(answers.user);
        promptUser();
      }
    })
  }
}

promptChoosingUser();
