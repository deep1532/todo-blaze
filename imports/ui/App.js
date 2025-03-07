import { Template } from 'meteor/templating';
import { TaskCollection } from '../db/TaskCollection';
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import './Login.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';


const HIDE_COMPLETED_STRING = "hideCompleted";
const IS_LOADING_STRING = "isLoading";
const TASK_PER_PAGE = 5;

const getUser = () => Meteor.user()
const isUserLogged = () => !!getUser();


Template.mainContainer.onCreated(function mainContainerOnCreated() {
    this.state = new ReactiveDict();

    this.state.set('currentPage', 1);
    this.state.set(HIDE_COMPLETED_STRING, false);
    this.state.set('searchQuery', '');
    this.state.set(IS_LOADING_STRING, true);
    this.state.set('tasks', []);
    this.state.set('totalPages', 1);
    this.state.set('totalTasks', 0);
    this.state.set('incompleteTasksCount', 0);

    this.fetchTasks = () => {
        const currentPage = this.state.get('currentPage');
        const hideCompleted = this.state.get(HIDE_COMPLETED_STRING);
        const searchQuery = this.state.get('searchQuery');

        Meteor.call('tasks.getAllTasks', searchQuery, hideCompleted, currentPage, TASK_PER_PAGE, (error, result) => {
            if (error) {
                console.log("Error in fetching the tasks: ", error.reason);
                this.state.set(IS_LOADING_STRING, false);
            }

            else {
                this.state.set('tasks', result.tasks);
                this.state.set('totalTasks', result.totalTasks);
                this.state.set('totalPages', result.totalPages);
                this.state.set('incompleteTasksCount', result.incompleteTasksCount);
                this.state.set(IS_LOADING_STRING, false);
            }
        });
    };

    this.fetchTasks();

    Tracker.autorun(() => {
        if (Session.get('taskUpdated')) {
            this.fetchTasks();
            Session.set('taskUpdated', false);
        }
    });
});

Template.mainContainer.events({
    'click #hide-completed-button'(event, instance) {
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
        instance.fetchTasks();
    },

    'click .user'() {
        Meteor.logout();
    },

    'click .previous-page'(event, instance) {
        const currentPage = instance.state.get('currentPage');
        if (currentPage > 1) {
            instance.state.set('currentPage', currentPage - 1);
            instance.fetchTasks();
        }
    },

    'click .next-page'(event, instance) {
        const currentPage = instance.state.get('currentPage');
        const totalPages = instance.state.get('totalPages');

        if (currentPage < totalPages) {
            instance.state.set('currentPage', currentPage + 1);
            instance.fetchTasks();
        }
    },

    'input #search-input'(event, instance) {
        const searchQuery = event.target.value;
        instance.state.set('searchQuery', searchQuery);
        instance.state.set('currentPage', 1);
        instance.fetchTasks();
    }
});

Template.mainContainer.helpers({
    tasks() {
        const instance = Template.instance();
        return instance.state.get('tasks');
    },

    hideCompleted() {
        return Template.instance().state.get(HIDE_COMPLETED_STRING)
    },

    totalTasks() {
        if (!isUserLogged()) {
            return '';
        }
        const totalTasks = Template.instance().state.get('totalTasks');

        return totalTasks ? `${totalTasks}` : '';
    },

    incompleteCount() {
        if (!isUserLogged()) {
            return '';
        }

        const incompleteTasksCount = Template.instance().state.get('incompleteTasksCount');

        return incompleteTasksCount ? `${incompleteTasksCount}` : '';
    },

    isUserLogged() {
        return isUserLogged();
    },

    getUser() {
        return getUser();
    },

    isLoading() {
        return Template.instance().state.get(IS_LOADING_STRING);
    },

    currentPage() {
        return Template.instance().state.get('currentPage')
    },

    totalPages() {
        return Template.instance().state.get('totalPages');
    },

    isPreviousPageAvailable() {
        const currentPage = Template.instance().state.get('currentPage');
        return currentPage > 1;
    },

    isNextPageAvailable() {
        const instance = Template.instance();

        const currentPage = instance.state.get('currentPage');
        const totalPages = instance.state.get('totalPages');

        return currentPage < totalPages;
    }
});