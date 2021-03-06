'use strict'

forEach = angular.forEach
element = angular.element

app = angular.module 'task.app',['layout.tools.app']


app.factory 'ids',[() ->
    []
]

app.value 'projects',[]

app.value 'taskLists',[]

app.factory 'addProject',['projects',(projects)->
    return (project)->
        if project not in projects
            projects.push project
        return
]

app.factory 'removeProject',['projects',(projects)->
    return (project)->
        if project in projects
            idx = projects.indexOf project
            projects.splice idx,1
        return
]
app.factory 'getProject',['projects',(projects)->
    return (project_id)->
        return projects.filter (itm)->
            if angular.isDefined itm['id']
                return project_id == itm['id']
            else
                return false
]

app.service 'projectService',['addProject','removeProject','getProject','projects',class projectService
                              constructor: (@addProject,@removeProject,@getProject,@projects)->
]

app.directive 'projectBox',['projectService',(projectService)->
    cfg =
        restrict:"E"
        require:"?ngModel"
        scope:
            proj:"@"
        link:(scope,ele,attrs,ctrl)->
            scope.project = scope.$parent.proj
            #scope.name = scope.$parent.proj.name
            console.log scope.$parent.proj
            console.log attrs
            console.log ctrl.$$viewValue
            return
        template:'<div class="panel panel-default">'+
                    '<div class="panel-heading">'+
                        '<h2 class="panel-title">{{ project.name }}</h2>'+
                    '</div>'+
                    '<div class="panel-body" style="color:white;background-color:{{ project.color }}">'+
                        '{{ project.subject }}'+
                    '</div>'+
                '</div>'
    return cfg
]
app.factory 'tasks',['loadData',(loadData) ->
    tasks = []
    query = loadData('data.json').then (res)->
        forEach res,(itm)->
            tasks.push itm
            return
        return
    tasks
]

app.factory 'loadData',['$q','$http',($q,$http)->
    return (filename)->
        defer = $q.defer()
        $http.get(filename)
        .then (res) ->
            defer.resolve res.data
        return defer.promise
]

app.filter 'YN',[() ->
    return (data)->
        if data
            return 'Yes'
        return 'No'
]
app.filter 'mydate',[() ->
    return (data)->
        if data != null
            dte = data.split '-'
            y = dte[0]
            m = dte[1]
            d = dte[2]
            return "#{m}-#{d}-#{y}"
        return ''
]
app.factory 'addTask',['tasks','newTask',(tasks,newTask) ->
    return (cfg) ->
        tasks.push newTask(cfg.title,cfg.content,cfg.due || null)
        return
]

app.factory 'removeTask',['tasks',(tasks) ->
    return (task)->
        if task in tasks
            idx = tasks.indexOf task
            task = null
            tasks.splice idx, 1
        return
]

app.service 'taskService',['tasks','addTask','removeTask',(tasks,addTask,removeTask) ->
    self = @

    self.addTask = (title,content,due) ->
        addTask
            title: title
            content: content
            due: due
        self.updateTasks()
        return

    self.removeTask = removeTask
    self.updateTasks = ()->
        self.tasks = tasks
        return

    self.getTask = (id) ->
        rtn = null
        forEach self.tasks,(itm)->
            if itm.id == parseInt id
                rtn = itm
                return
        return rtn

    self.getAllTasks = () ->
        return self.tasks
    self.completeTask = (task)->
        #task._complete = 'Yes'
    self.updateTasks()
    return
]

app.factory 'getId',['ids',(ids)->
    return ()->
        newId = ids.length + 1
        ids.push newId
        return newId
]

app.factory 'newTask',['getId',(getId) ->
    return (title,content,due) ->
        if due
            if due instanceof Date
                due = due.toISOString().split('T')[0]
        rtn =
        id : getId()
        title: title
        content : content
        date_added : new Date().toISOString().split('T')[0]
        date_due : due
        complete : false
        _complete : 'No'
        archived : false
        date_completed : null
        return rtn
]

app.factory 'completeTaskList', [()->
    return []
]

app.factory 'removeCompleteTask',['completeTaskList',(completeTaskList)->
    return (task)->
        if task in completeTaskList
            idx = completeTaskList.indexOf task
            task = null
            completeTaskList.splice idx, 1
]

app.factory 'addCompleteTask', ['taskService','completeTaskList',(taskService,completeTaskList)->
    return (id)->
        task = taskService.getTask id
        console.log 'getting task: ',task,', with id: ',id
        taskService.removeTask task
        completeTaskList.push task
        return
]

app.service 'completeTaskService', ['addCompleteTask','removeCompleteTask','completeTaskList',(addCompleteTask,removeCompleteTask,completeTaskList)->
    self = @

    self.addTask = addCompleteTask
    self.removeTask = removeCompleteTask
    self.tasks = completeTaskList

    self.getTask = (id)->
        rtn = null
        forEach self.tasks,(itm)->
            if itm.id == parseInt id
                rtn = itm
                return
        return rtn

    self.getAllTasks = ()->
        return self.tasks
    return
]


app.factory 'reopenCompleteTask', ['completeTaskService','taskService',(completeTaskService,taskService)->
    return (id)->
        task = completeTaskService.getTask id
        completeTaskService.removeTask task
        console.log task.date_due
        taskService.addTask task.title,task.content,task.date_due
]

app.service 'state',['addTask',(addTask) ->
    self = @
    self.setTitle = (@title)->

    self.setContent = (@content)->

    self.setDueDate = (@due) ->

    self.addTask = () ->
        self.task =
            formTask: addTask(
                self.title,
                self.content,
                self.due
            )
        return
    return
]


app.directive 'finishBox',['taskService','completeTaskService',(taskService,completeTaskService) ->
    cfg =
        restrict:"E"
        template:'<input ng-click=complete() ng-model="task.complete" type=checkbox class=checkbox />'
        replace:true
        require:"ngModel"
        scope:
            complete: "&"
            task:"="
        link:(scope,ele,attrs)->
            scope.complete = ()->
                id = ele.parent().parent().attr('id')
                #id = ele.parent().parent().parent().attr('id')
                console.log 'id: ',id
                console.log ele
                console.log 'adding: ',id
                console.log 'task: ', attrs.task
                completeTaskService.addTask id

                #currIdx = 0
                #rows = document.getElementsByClassName 'tableRow'
                #forEach rows,(itm,idx)->
                #    if element(itm)[0] == ele.parent().parent()[0]
                #        currIdx = idx
                #        console.log 'index: ',idx
                #txt = angular.element(document.getElementsByTagName('td')[1]).text()
                #el = element(element(element(document.getElementsByTagName('tbody')[0]).children()[currIdx]).children()[1])
                #compEl = element(element(element(document.getElementsByTagName('tbody')[0]).children()[currIdx]).children()[4])
                #txt = el.text()
                #console.log txt
                #console.log ele.parent().parent(),el
                #element(document.getElementsByTagName('td')[currIdx]).html "<s>#{txt}</s>"
                #compEl.text 'Yes'
                #el.html "<s>#{txt}</s>"
                scope.$emit 'task:complete' , id
                return
            return
    return cfg

]

app.directive 'closeButton',['removeTask', (removeTask) ->
    cfg =
        restrict:"E"
        template:'<span class="glyphicon glyphicon-remove text-danger" style="cursor:pointer;"><span ng-transclude></span></span>'
        transclude:true
        scope:
            task : "="
        link : (scope,ele,attrs)->
            task = attrs.task
            ele.on "click", ()->
                removeTask task
                ele.parent().parent().remove()
                scope.$emit 'task:removed',task
                return
            return
    return cfg
]

app.controller 'TaskListCtrl',['projectService','completeTaskService','taskService','$scope','ids','reopenCompleteTask',(projectService,completeTaskService,taskService,$scope,ids,reopen)->
        self = @

        Object.defineProperty self, 'tst',
            get:()->
                return self._tst || 'good'
            set:(val)->
                self._tst = val

        proj =
            name:'test'
            id:2
            color:"#333333"
            subject:"A new Cool Project"
        proj2 =
            name:'second test'
            id:54
            color:'#545454'
            subject:'lotsa stuff
            '
        projectService.addProject proj
        projectService.addProject proj2
        self.items = {}

        self.getProjects = ()->
            self.items.projects = projectService.projects

        self.getProjects()
        $scope.ids = ids;
        $scope.taskService = taskService
        $scope.reopenCompleteTask = reopen


        self.setComplete = ()->
            if not $scope.$parent.$$phase
                $scope.$apply ()->
                    self.completeTasks = completeTaskService.getAllTasks()
                    return
            else
                self.completeTasks = completeTaskService.getAllTasks()
                return
        self.setComplete()

        self.setTasks = ()->
            if not $scope.$parent.$$phase
                $scope.$apply ()->
                    self.tasks = taskService.getAllTasks()
                    return
            else
                self.tasks = taskService.getAllTasks()
            return

        self.setTasks()

        $scope.addTask = ()->
            taskService.addTask $scope.task.title,$scope.task.content,$scope.task.due
            $scope.resetTask()
            return

        $scope.resetTask = ()->
            $scope.task =
                title:''
                content:''
                due:''

        $scope.getComplete = (arg)->
            if arg
                return 'Yes'
            else
                return 'No'

        $scope.$on 'task:removed', (task)->
            console.log "removing:", task.targetScope.task.title
            taskService.removeTask task.targetScope.task
            self.setTasks()
            self.setComplete()
            return

        $scope.$on 'task:complete',(event,task)->
            taskService.completeTask task

        $scope.resetTask()
        return
]
