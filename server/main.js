import { Meteor } from 'meteor/meteor';
import { TaskCollection } from "/imports/db/TaskCollection";
import { Accounts } from 'meteor/accounts-base';
import "/imports/api/TaskMethods"
import "/imports/api/TaskPublication";


const insertTask = (taskText, user) =>
  TaskCollection.insert({
    text: taskText,
    userId: user._id,
    createdAt: new Date(),
    isChecked: false,
  });


const SEED_USERNAME = "drtank"
const SEED_PASSWORD = "deep123"

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD
    });
  }

  const user = Accounts.findUserByUsername(SEED_USERNAME)

  if (TaskCollection.find().count() === 0) {
    [
      'First task',
      'Second task',
      'Third task',
      'Fourth task',
      'Fifth task',
      'Sixth task',
      'Seventh task',
      'Eighth task'
    ].forEach(taskText => insertTask(taskText, user))
  }
});