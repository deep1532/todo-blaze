import { Template } from "meteor/templating"
import "./Task.html"
import { Meteor } from "meteor/meteor";
import { TaskCollection } from "../db/TaskCollection";
import { Session } from "meteor/session";

Template.task.events({
    "click .toggle-checked"() {
        Meteor.call('tasks.setIsChecked', this._id, !this.isChecked, (error, result) => {

            if (!error) {
                Session.set('taskUpdated', true);
            }
        });
    },

    "click .delete"() {
        Meteor.call('tasks.remove', this._id, (error, result) => {
            if (!error) {
                Session.set('taskUpdated', true);
            }
        });
    }
});

Template.form.events({
    'submit .task-form'(event) {
        event.preventDefault();

        const text = event.target.text.value;

        Meteor.call('tasks.insert', text, (error, result) => {
            if (!error) {
                Session.set('taskUpdated', true);
            }
        });

        event.target.text.value = '';
    },
});