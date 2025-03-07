import { check } from "meteor/check";
import { TaskCollection } from "../db/TaskCollection";
import { Meteor } from "meteor/meteor";

Meteor.methods({
    'tasks.insert'(text) {
        check(text, String)

        if (!this.userId) {
            throw new Meteor.Error('Not Authorized');
        }

        TaskCollection.insert({
            text,
            userId: this.userId,
            createdAt: new Date(),
            isChecked: false
        });
    },

    'tasks.remove'(taskId) {
        check(taskId, String)

        if (!this.userId) {
            throw new Meteor.Error('Not Authorized');
        }

        const task = TaskCollection.findOne({ _id: taskId, userId: this.userId });

        if (!task) {
            throw new Meteor.Error('Access denied');
        }

        TaskCollection.remove(taskId);
    },

    'tasks.setIsChecked'(taskId, isChecked) {
        check(taskId, String)
        check(isChecked, Boolean)

        if (!this.userId) {
            throw new Meteor.Error('not Authorized');
        }

        const task = TaskCollection.findOne({ _id: taskId, userId: this.userId });

        if (!task) {
            throw new Meteor.Error('Access denied');
        }

        TaskCollection.update(taskId, { $set: { isChecked } });
    },

    'tasks.getAllTasks'(searchQuery = '', hideCompleted = false, currentPage = 1, tasksPerPage = 5) {

        if (!this.userId) {
            throw new Meteor.Error('Not Authorized');
        }

        let query = { userId: this.userId }

        const totalTasks = TaskCollection.find(query).count();
        const incompleteTasksCount = TaskCollection.find(query).fetch().filter(task => !task.isChecked).length;

        if (hideCompleted) {
            query.isChecked = { $ne: true };
        }

        if (searchQuery) {
            query.text = { $regex: searchQuery, $options: 'i' }
        }

        const totalTasksAfterQuery = TaskCollection.find(query).count();
        const totalPages = Math.ceil(totalTasksAfterQuery / tasksPerPage);

        const tasks = TaskCollection.find(query, {
            sort: { createdAt: -1 },
            skip: (currentPage - 1) * tasksPerPage,
            limit: tasksPerPage,
        }).fetch();


        return { tasks, totalTasks, totalPages, incompleteTasksCount };
    }
});