import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';
import { Task } from './Task';
import { Tasks } from '/imports/api/tasks';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

const toggleChecked = ({ _id, isChecked }) => {
  Meteor.call('tasks.setChecked', _id, !isChecked);
};

const togglePrivate = ({ _id, isPrivate }) => {
  Meteor.call('tasks.setPrivate', _id, !isPrivate);
};

const deleteTask = ({ _id }) => Meteor.call('tasks.remove', _id);

export const App = () => {
  const filter = { };

  const [hideCompleted, setHideCompleted] = useState(false);

  if (hideCompleted) {
    _.set(filter, 'checked', false);
  }

  const {
      myTasks,
      otherTasks,
      incompleteTasksCount,
      user,
      myTasksHandle,
      allTasksHandle,
      privateTasksHandle,
  } = useTracker(() => {
    const allTasksHandle = Meteor.subscribe('allTasks');
    const myTasksHandle = Meteor.subscribe('myTasks');
    const privateTasksHandle = Meteor.subscribe('privateTasks');

    return ({
      myTasks: Tasks.find(
          {...filter, username: 'meteorite'},
          {sort: {createdAt: -1}}
      ).fetch(),
      otherTasks: Tasks.find(
          {...filter, username: {$ne: 'meteorite'}},
          {sort: {createdAt: -1}}
      ).fetch(),
      incompleteTasksCount: Tasks.find({checked: {$ne: true}}).count(),
      user: Meteor.user(),
      allTasksHandle,
      myTasksHandle,
      privateTasksHandle,
    });
  },[hideCompleted]);

  if (!user) {
    return (
      <div className="simple-todos-react">
        <LoginForm/>
      </div>
    );
  }

  if (!myTasksHandle.ready() || !allTasksHandle.ready() || !privateTasksHandle.ready()) {
    return (
      <div className="simple-todos-react loading">
        <h1>
            <span className="loader"></span>
            <div>{!myTasksHandle.ready() && 'myTasksHandle is still loading...'}</div>
            <div>{!allTasksHandle.ready() && 'allTasksHandle is still loading...'}</div>
            <div>{!privateTasksHandle.ready() && 'privateTasksHandle is still loading...'}</div>
        </h1>
      </div>
    );
  }

    console.log('myTasks', myTasks.length);
    console.log('otherTasks', otherTasks.length);

  return (
    <div className="simple-todos-react">
      <h1>Todo List ({ incompleteTasksCount })</h1>

      <div className="filters">
        <label>
          <input
              type="checkbox"
              readOnly
              checked={ Boolean(hideCompleted) }
              onClick={() => setHideCompleted(!hideCompleted)}
          />
          Hide Completed
        </label>
      </div>

      <div className="tasks">
        <ul>
        { myTasks.length === 0 && (
          <div className="no-tasks">
              <p>I don't have any tasks yet. Add one below!</p>
          </div>
        )}
        { myTasks.map(task => <Task
          key={ task._id }
          task={ task }
          onCheckboxClick={toggleChecked}
          onDeleteClick={deleteTask}
          onTogglePrivateClick={togglePrivate}
        />) }
        </ul>
      </div>

      <div className="tasks">
        <ul>
            { otherTasks.length === 0 && (
                <div className="no-tasks">
                    <p>No other tasks yet. They should add more!</p>
                </div>
            )}
            { otherTasks.map(task => <Task
                key={ task._id }
                task={ task }
                onCheckboxClick={toggleChecked}
                onDeleteClick={deleteTask}
                onTogglePrivateClick={togglePrivate}
            />) }
        </ul>
      </div>
      <TaskForm />
    </div>
  );
};
