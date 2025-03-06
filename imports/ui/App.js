import { Template } from 'meteor/templating';
import { TaskCollection } from '../db/TaskCollection';
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import './Login.js';
import { Meteor } from 'meteor/meteor';


const HIDE_COMPLETED_STRING = "hideCompleted";
const IS_LOADING_STRING = "isLoading";
const TASK_PER_PAGE = 5;

const getUser = () => Meteor.user()
const isUserLogged = () => !!getUser();

const getFilteredTasks = (searchQuery = '', hideCompleted = false) => {
    const user = getUser();

    const hideCompletedFilter = { isChecked: { $ne: true } }

    const userFilter = user ? { userId: user._id } : {}

    const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter }

    let filteredTasks = hideCompleted ? pendingOnlyFilter : userFilter;

    if (searchQuery) {
        filteredTasks = { ...filteredTasks, text: { $regex: searchQuery, $options: 'i' } };
    }

    return filteredTasks;
}

Template.mainContainer.onCreated(function mainContainerOnCreated() {
    this.state = new ReactiveDict();

    this.state.set('currentPage', 1);
    this.state.set(HIDE_COMPLETED_STRING, false);
    this.state.set('searchQuery', '');

    const handler = Meteor.subscribe('tasks');

    Tracker.autorun(() => {
        this.state.set(IS_LOADING_STRING, !handler.ready());
    });
});

Template.mainContainer.events({
    'click #hide-completed-button'(event, instance) {
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING)
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted)
    },

    'click .user'() {
        Meteor.logout();
    },

    'click .previous-page'(event, instance) {
        const currentPage = instance.state.get('currentPage');
        if (currentPage > 1) {
            instance.state.set('currentPage', currentPage - 1);
        }
    },

    'click .next-page'(event, instance) {
        const currentPage = instance.state.get('currentPage');
        const searchQuery = instance.state.get('searchQuery').toLowerCase();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        const filteredTasks = getFilteredTasks(searchQuery, hideCompleted);
        const filteredTasksCount = TaskCollection.find(filteredTasks).count();
        const totalPages = Math.ceil(filteredTasksCount / TASK_PER_PAGE);

        if (currentPage < totalPages) {
            instance.state.set('currentPage', currentPage + 1);
        }
    },

    'input #search-input'(event, instance) {
        const searchQuery = event.target.value;
        instance.state.set('searchQuery', searchQuery);
        instance.state.set('currentPage', 1);
    }
});

Template.mainContainer.helpers({
    tasks() {

        const instance = Template.instance();

        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        const searchQuery = instance.state.get('searchQuery').toLowerCase();
        const currentPage = instance.state.get('currentPage');

        if (!isUserLogged()) {
            return [];
        }

        const filteredTasks = getFilteredTasks(searchQuery, hideCompleted);

        const skip = (currentPage - 1) * TASK_PER_PAGE;

        return TaskCollection.find(filteredTasks, { skip, limit: TASK_PER_PAGE, sort: { createdAt: -1 } }).fetch();
    },

    hideCompleted() {
        return Template.instance().state.get(HIDE_COMPLETED_STRING)
    },

    incompleteCount() {
        if (!isUserLogged()) {
            return '';
        }

        const hideCompleted = Template.instance().state.get(HIDE_COMPLETED_STRING);
        const filteredTasks = getFilteredTasks('', hideCompleted);
        const incompleteTaskCount = TaskCollection.find(filteredTasks).count();

        return incompleteTaskCount ? `${incompleteTaskCount}` : '';
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
        const instance = Template.instance();

        const searchQuery = instance.state.get('searchQuery').toLowerCase();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        const filteredTasks = getFilteredTasks(searchQuery, hideCompleted);
        const filteredTasksCount = TaskCollection.find(filteredTasks).count();

        return Math.ceil(filteredTasksCount / TASK_PER_PAGE);
    },

    isPreviousPageAvailable() {
        const currentPage = Template.instance().state.get('currentPage');
        return currentPage > 1;
    },

    isNextPageAvailable() {
        const instance = Template.instance();

        const currentPage = instance.state.get('currentPage');
        const searchQuery = instance.state.get('searchQuery').toLowerCase();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        const filteredTasks = getFilteredTasks(searchQuery, hideCompleted);
        const filteredTasksCount = TaskCollection.find(filteredTasks).count();
        const totalPages = Math.ceil(filteredTasksCount / TASK_PER_PAGE);

        return currentPage < totalPages;
    }
});

Template.form.events({
    'submit .task-form'(event) {
        event.preventDefault();

        const text = event.target.text.value;

        Meteor.call('tasks.insert', text);

        event.target.text.value = '';
    },
});