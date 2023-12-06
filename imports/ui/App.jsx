import React, {useState} from 'react';
import {useTracker} from 'meteor/react-meteor-data';
import _ from 'lodash';
import {Task} from './Task';
import {Tasks} from '/imports/api/tasks';
import {TaskForm} from './TaskForm';
import {LoginForm} from './LoginForm';

const toggleChecked = ({_id, isChecked}) => {
    Meteor.call('tasks.setChecked', _id, !isChecked);
};

const togglePrivate = ({_id, isPrivate}) => {
    Meteor.call('tasks.setPrivate', _id, !isPrivate);
};

const deleteTask = ({_id}) => Meteor.call('tasks.remove', _id);

export const App = () => {
    const filter = {};

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
    } = useTracker(() => {
        const allTasksHandle = Meteor.subscribe('allTasks');
        const myTasksHandle = Meteor.subscribe('myTasks');

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
        });
    }, [hideCompleted]);

    if (!user) {
        return (
            <div className="simple-todos-react">
                <LoginForm/>
            </div>
        );
    }


    return (
        <div className="simple-todos-react">
            <h1>Todo List ({incompleteTasksCount})</h1>

            <pre>{JSON.stringify(user, null, 2)}</pre>

            <div className="simple-todos-react loading">
                <h1>
                    <div>
                        myTasksHandle is {myTasksHandle.ready()
                        ? <span style={{color: 'green'}}>ready</span>
                        : <span style={{color: 'black'}}>not ready</span>}
                    </div>
                    <div>
                        allTasksHandle is {allTasksHandle.ready()
                        ? <span style={{color: 'green'}}>ready</span>
                        : <span style={{color: 'black'}}>not ready</span>}
                    </div>
                </h1>
            </div>
        </div>
    )
        ;
};
