import { Meteor } from 'meteor/meteor';
import '/imports/api/tasks';
import {Tasks} from "../imports/api/tasks";

const SETUP_COUNT_MULTIPLIER = 500;

Meteor.startup(() => {
  if (!Accounts.findUserByUsername('meteorite')) {
    Accounts.createUser({
      username: 'meteorite',
      password: 'password'
    });
  }
  const meteoriteUserTasksCount = Tasks.find({username: 'meteorite'}).count();
  const meteoriteUserTasksTarget = SETUP_COUNT_MULTIPLIER * 10;
  if (meteoriteUserTasksCount < meteoriteUserTasksTarget) {
    // Insert tasks until we have the target amount
    for (let i = meteoriteUserTasksCount; i <= meteoriteUserTasksTarget; i++) {
      Tasks.insert({
        text: `Task ${i}`,
        createdAt: new Date,
        owner: Meteor.users.findOne({username: 'meteorite'})._id,
        username: 'meteorite',
        // make every third one private
        isPrivate: i % 3 === 0
      })
    }
  }
  const userCount = Meteor.users.find().count();
  const userTarget = SETUP_COUNT_MULTIPLIER;
  if (userCount < userTarget) {
    // Insert users until we have the target amount
    for (let i = userCount; i <= userTarget; i++) {
        Accounts.createUser({
            username: `user${i}`,
            password: 'password'
        });
        const user = Accounts.findUserByUsername(`user${i}`);
        // Insert up to 100 tasks per user
        for (let j = 0; j <= userTarget; j++) {
          Tasks.insert({
            text: `Task ${j}`,
            createdAt: new Date,
            owner: user._id,
            username: user.username,
            // make every third one private
            isPrivate: i % 3 === 0
          })
        }
    }
  }
});
