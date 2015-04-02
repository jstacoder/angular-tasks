'use strict';

var app,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

app = angular.module('task.app', []);

app.factory('ids', [
  function() {
    return [];
  }
]);

app.factory('tasks', [
  function() {
    return [];
  }
]);

app.filter('YN', [
  function() {
    return function(data) {
      if (data) {
        return 'Yes';
      }
      return 'No';
    };
  }
]);

app.filter('mydate', [
  function() {
    return function(data) {
      var d, dte, m, y;
      dte = data.split('-');
      y = dte[0];
      m = dte[1];
      d = dte[2];
      return "" + m + "-" + d + "-" + y;
    };
  }
]);

app.factory('addTask', [
  'tasks', 'newTask', function(tasks, newTask) {
    return function(cfg) {
      tasks.push(newTask(cfg.title, cfg.content, cfg.due || null));
    };
  }
]);

app.factory('removeTask', [
  'tasks', function(tasks) {
    return function(task) {
      var idx;
      if (__indexOf.call(tasks, task) >= 0) {
        idx = tasks.indexOf(task);
        task = null;
        tasks.splice(idx, 1);
      }
    };
  }
]);

app.service('taskService', [
  'tasks', 'addTask', 'removeTask', function(tasks, addTask, removeTask) {
    var self;
    self = this;
    self.addTask = function(title, content, due) {
      return addTask({
        title: title,
        content: content,
        due: due
      });
    };
    self.removeTask = removeTask;
    self.tasks = tasks;
    self.getTask = function(id) {
      return self.tasks[id];
    };
    self.getAllTasks = function() {
      return self.tasks;
    };
    self.completeTask = function(task) {
      return task._complete = 'Yes';
    };
  }
]);

app.factory('getId', [
  'ids', function(ids) {
    return function() {
      var newId;
      newId = ids.length + 1;
      ids.push(newId);
      return newId;
    };
  }
]);

app.factory('newTask', [
  'getId', function(getId) {
    return function(title, content, due) {
      return {
        id: getId(),
        title: title,
        content: content,
        date_added: new Date().toISOString().split('T')[0],
        date_due: due.toISOString().split('T')[0],
        complete: false,
        _complete: 'No',
        archived: false,
        date_completed: null
      };
    };
  }
]);

app.service('state', [
  'addTask', function(addTask) {
    var self;
    self = this;
    self.setTitle = function(title) {
      this.title = title;
    };
    self.setContent = function(content) {
      this.content = content;
    };
    self.setDueDate = function(due) {
      this.due = due;
    };
    self.addTask = function() {
      self.task = {
        formTask: addTask(self.title, self.content, self.due)
      };
    };
  }
]);

app.directive('finishBox', [
  'taskService', function(taskService) {
    var cfg;
    cfg = {
      restrict: "E",
      template: '<input ng-click=complete() ng-model="task.complete" type=checkbox class=checkbox />',
      replace: true,
      require: "ngModel",
      scope: {
        complete: "&",
        task: "="
      },
      link: function(scope, ele, attrs) {
        scope.complete = function() {
          var txt;
          txt = angular.element(document.getElementsByTagName('td')[1]).text();
          console.log(txt);
          angular.element(document.getElementsByTagName('td')[1]).html("<s>" + txt + "</s>");
          scope.$emit('task:complete', attrs.task);
        };
      }
    };
    return cfg;
  }
]);

app.directive('closeButton', [
  'removeTask', function(removeTask) {
    var cfg;
    cfg = {
      restrict: "E",
      template: '<span class="glyphicon glyphicon-remove text-danger" style="cursor:pointer;"><span ng-transclude></span></span>',
      transclude: true,
      scope: {
        task: "="
      },
      link: function(scope, ele, attrs) {
        var task;
        task = attrs.task;
        ele.on("click", function() {
          removeTask(task);
          ele.parent().parent().remove();
          scope.$emit('task:removed', task);
        });
      }
    };
    return cfg;
  }
]);

app.controller('TaskListCtrl', [
  'taskService', '$scope', function(taskService, $scope) {
    var self;
    self = this;
    self.setTasks = function() {
      if (!$scope.$parent.$$phase) {
        $scope.$apply(function() {
          self.tasks = taskService.getAllTasks();
        });
      } else {
        self.tasks = taskService.getAllTasks();
      }
    };
    self.setTasks();
    $scope.addTask = function() {
      taskService.addTask($scope.task.title, $scope.task.content, $scope.task.due);
      $scope.resetTask();
    };
    $scope.resetTask = function() {
      return $scope.task = {
        title: '',
        content: '',
        due: ''
      };
    };
    $scope.getComplete = function(arg) {
      if (arg) {
        return 'Yes';
      } else {
        return 'No';
      }
    };
    $scope.$on('task:removed', function(task) {
      console.log("removing:", task.targetScope.task.title);
      taskService.removeTask(task.targetScope.task);
      self.setTasks();
    });
    $scope.$on('task:complete', function(event, task) {
      return taskService.completeTask(task);
    });
    $scope.resetTask();
  }
]);
