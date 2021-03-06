'use strict';
var app, element, forEach, projectService,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

forEach = angular.forEach;

element = angular.element;

app = angular.module('task.app', ['layout.tools.app']);

app.factory('ids', [
  function() {
    return [];
  }
]);

app.value('projects', []);

app.value('taskLists', []);

app.factory('addProject', [
  'projects', function(projects) {
    return function(project) {
      if (__indexOf.call(projects, project) < 0) projects.push(project);
    };
  }
]);

app.factory('removeProject', [
  'projects', function(projects) {
    return function(project) {
      var idx;
      if (__indexOf.call(projects, project) >= 0) {
        idx = projects.indexOf(project);
        projects.splice(idx, 1);
      }
    };
  }
]);

app.factory('getProject', [
  'projects', function(projects) {
    return function(project_id) {
      return projects.filter(function(itm) {
        if (angular.isDefined(itm['id'])) {
          return project_id === itm['id'];
        } else {
          return false;
        }
      });
    };
  }
]);

app.service('projectService', [
  'addProject', 'removeProject', 'getProject', 'projects', projectService = (function() {

    function projectService(addProject, removeProject, getProject, projects) {
      this.addProject = addProject;
      this.removeProject = removeProject;
      this.getProject = getProject;
      this.projects = projects;
    }

    return projectService;

  })()
]);

app.directive('projectBox', [
  'projectService', function(projectService) {
    var cfg;
    cfg = {
      restrict: "E",
      require: "?ngModel",
      scope: {
        proj: "@"
      },
      link: function(scope, ele, attrs, ctrl) {
        scope.project = scope.$parent.proj;
        console.log(scope.$parent.proj);
        console.log(attrs);
        console.log(ctrl.$$viewValue);
      },
      template: '<div class="panel panel-default">' + '<div class="panel-heading">' + '<h2 class="panel-title">{{ project.name }}</h2>' + '</div>' + '<div class="panel-body" style="color:white;background-color:{{ project.color }}">' + '{{ project.subject }}' + '</div>' + '</div>'
    };
    return cfg;
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
      if (data !== null) {
        dte = data.split('-');
        y = dte[0];
        m = dte[1];
        d = dte[2];
        return "" + m + "-" + d + "-" + y;
      }
      return '';
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
      var rtn;
      if (due) if (due instanceof Date) due = due.toISOString().split('T')[0];
      rtn = {
        id: getId(),
        title: title,
        content: content,
        date_added: new Date().toISOString().split('T')[0],
        date_due: due,
        complete: false,
        _complete: 'No',
        archived: false,
        date_completed: null
      };
      return rtn;
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
  }
]);

app.factory('reopenCompleteTask', [
  'completeTaskService', 'taskService', function(completeTaskService, taskService) {
    return function(id) {
      var task;
      task = completeTaskService.getTask(id);
      completeTaskService.removeTask(task);
      console.log(task.date_due);
      return taskService.addTask(task.title, task.content, task.date_due);
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
          console.log(ele);
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
  'projectService', 'completeTaskService', 'taskService', '$scope', 'ids', 'reopenCompleteTask', function(projectService, completeTaskService, taskService, $scope, ids, reopen) {
    var proj, proj2, self;
    self = this;
    Object.defineProperty(self, 'tst', {
      get: function() {
        return self._tst || 'good';
      },
      set: function(val) {
        return self._tst = val;
      }
    });
    proj = {
      name: 'test',
      id: 2,
      color: "#333333",
      subject: "A new Cool Project"
    };
    proj2 = {
      name: 'second test',
      id: 54,
      color: '#545454',
      subject: 'lotsa stuff\
            '
    };
    projectService.addProject(proj);
    projectService.addProject(proj2);
    self.items = {};
    self.getProjects = function() {
      return self.items.projects = projectService.projects;
    };
    self.getProjects();
    $scope.ids = ids;
    $scope.taskService = taskService;
    $scope.reopenCompleteTask = reopen;
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
