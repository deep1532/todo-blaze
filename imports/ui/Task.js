import { Template } from "meteor/templating"
import "./Task.html"
import { Meteor } from "meteor/meteor";

Template.task.events({
    "click .toggle-checked"() {
        Meteor.call('tasks.setIsChecked', this._id, !this.isChecked);
    },
});

Template.task.events({
    "click .delete"() {
        Meteor.call('tasks.remove', this._id);
    }
})