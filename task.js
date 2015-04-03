'use strict';
var app, element, forEach,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

forEach = angular.forEach;

element = angular.element;

app = angular.module('task.app', []);

app.factory('ids', [
  function() {
    return [];
  }
]);

app.factory('tasks', [
  'loadData', function(loadData) {
    var query, tasks;
    tasks = [];
    query = loadData('data.json').then(function(res) {
      forEach(res, function(itm) {
        tasks.push(itm);
      });
    });
    return tasks;
  }
]);

app.factory('loadData', [
  '$q', '$http', function($q, $http) {
    return function(filename) {
      var defer;
      defer = $q.defer();
      $http.get(filename).then(function(res) {
        return defer.resolve(res.data);
      });
      return defer.promise;
    };
  }
]);

app.filter('YN', [
  function() {
    return function(data) {
      if (data) return 'Yes';
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
      addTask({
        title: title,
        content: content,
        due: due
      });
      self.updateTasks();
    };
    self.removeTask = removeTask;
    self.updateTasks = function() {
      self.tasks = tasks;
    };
    self.getTask = function(id) {
      var rtn;
      rtn = null;
      forEach(self.tasks, function(itm) {
        if (itm.id === parseInt(id)) rtn = itm;
      });
      return rtn;
    };
    self.getAllTasks = function() {
      return self.tasks;
    };
    self.completeTask = function(task) {};
    self.updateTasks();
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

app.factory('completeTaskList', [
  function() {
    return [];
  }
]);

app.factory('removeCompleteTask', [
  'completeTaskList', function(completeTaskList) {
    return function(task) {
      var idx;
      if (__indexOf.call(completeTaskList, task) >= 0) {
        idx = completeTaskList.indexOf(task);
        task = null;
        return completeTaskList.splice(idx, 1);
      }
    };
  }
]);

app.factory('addCompleteTask', [
  'taskService', 'completeTaskList', function(taskService, completeTaskList) {
    return function(id) {
      var task;
      task = taskService.getTask(id);
      console.log('getting task: ', task, ', with id: ', id);
      taskService.removeTask(task);
      completeTaskList.push(task);
    };
  }
]);

app.service('completeTaskService', [
  'addCompleteTask', 'removeCompleteTask', 'completeTaskList', function(addCompleteTask, removeCompleteTask, completeTaskList) {
    var self;
    self = this;
    self.addTask = addCompleteTask;
    self.removeTask = removeCompleteTask;
    self.tasks = completeTaskList;
    self.getTask = function(id) {
      forEach(self.tasks, function(itm) {
        if (itm.id === id) return itm;
      });
      return null;
    };
    self.getAllTasks = function() {
      return self.tasks;
    };
  }
]);

app.factory('reopenCompleteTask', [
  'completeTaskService', 'taskService', function(completeTaskService, taskService) {
    return function(id) {
      var task;
      task = completeTaskService.getTask(id);
      completeTaskService.removeTask(task);
      return taskService.addTask(task.title, task.content, task.due);
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
  'taskService', 'completeTaskService', function(taskService, completeTaskService) {
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
          var id;
          id = ele.parent().parent().attr('id');
          console.log('id: ', id);
          console.log('adding: ', id);
          console.log('task: ', attrs.task);
          completeTaskService.addTask(id);
          scope.$emit('task:complete', id);
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
  'completeTaskService', 'taskService', '$scope', 'ids', function(completeTaskService, taskService, $scope, ids) {
    var self;
    self = this;
    $scope.ids = ids;
    $scope.taskService = taskService;
    self.setComplete = function() {
      if (!$scope.$parent.$$phase) {
        return $scope.$apply(function() {
          self.completeTasks = completeTaskService.getAllTasks();
        });
      } else {
        self.completeTasks = completeTaskService.getAllTasks();
      }
    };
    self.setComplete();
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
      self.setComplete();
    });
    $scope.$on('task:complete', function(event, task) {
      return taskService.completeTask(task);
    });
    $scope.resetTask();
  }
]);
