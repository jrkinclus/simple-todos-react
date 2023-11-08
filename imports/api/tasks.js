import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { publishComposite } from 'meteor/reywood:publish-composite';

export const Tasks = new Mongo.Collection('tasks');

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    Tasks.insert({
      text,
      createdAt: new Date,
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username
    })
  },

  'tasks.remove'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);

    if (!this.userId || task.owner !== this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    Tasks.remove(taskId);
  },

  'tasks.setChecked'(taskId, isChecked) {
    check(taskId, String);
    check(isChecked, Boolean);

    const task = Tasks.findOne(taskId);

    if (task.isPrivate && task.owner !== this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    Tasks.update(taskId, {
      $set: {
        isChecked
      }
    });
  },

  'tasks.setPrivate'(taskId, isPrivate) {
    check(taskId, String);
    check(isPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    if (!this.userId || task.owner !== this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    Tasks.update(taskId, {
      $set: {
        isPrivate
      }
    })
  }
});

if (Meteor.isServer) {
  publishComposite('allTasks', function() {
    return {
      find() {
       return Meteor.users.find();
     },
      children: [
        {
            find(user) {
                return Tasks.find({
                    owner: user._id,
                    isPrivate: {$ne: true},
                  // Publish only partial fields for other people's tasks
                },{fields: {
                    owner: 1,
                    username: 1,
                    isPrivate: 1,
                    checked: 1,
                    createdAt: 1,
                }});
            }
        }
      ]
    };
  });


  publishComposite('myTasks', function() {
    return {
      find() {
        return Meteor.users.find(this.userId);
      },
      children: [
        {
          find(user) {
            // Publish all fields for my tasks
            return Tasks.find({
              owner: user._id
            });
          }
        }
      ]
    };
  })


  publishComposite('privateTasks', function() {
    return {
      find() {
        return Meteor.users.find(this.userId);
      },
      children: [
        {
          find(user) {
            // Publish only their existance for counting incomplete tasks
            return Tasks.find({
              owner: user._id
            },  {fields: { isPrivate: 1, isChecked: 1 }});
          }
        }
      ]
    };
  })
}
