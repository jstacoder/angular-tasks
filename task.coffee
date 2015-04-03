'use strict'

forEach = angular.forEach
element = angular.element

app = angular.module 'task.app',[]



app.factory 'ids',[() ->
    []
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
        dte = data.split '-'
        y = dte[0]
        m = dte[1]
        d = dte[2]
        return "#{m}-#{d}-#{y}"
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
    
    self.removeTask = removeTask
    self.tasks = tasks
    self.getTask = (id) ->
        return self.tasks[id]
    self.getAllTasks = () ->
        return self.tasks
    self.completeTask = (task)->
        #task._complete = 'Yes'
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
        id : getId()
        title: title
        content : content
        date_added : new Date().toISOString().split('T')[0]
        date_due : due.toISOString().split('T')[0]
        complete : false
        _complete : 'No'
        archived : false
        date_completed : null
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


app.directive 'finishBox',['taskService',(taskService) ->
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
                currIdx = null
                checkboxs = document.getElementsByClassName 'checkbox'
                forEach checkboxs,(itm,idx)->
                    if angular.equals itm,ele[0]
                        currIdx = idx
                #txt = angular.element(document.getElementsByTagName('td')[1]).text()
                txt = angular.element(document.getElementsByTagName('td')[idx]).text()
                console.log txt
                angular.element(document.getElementsByTagName('td')[idx]).html "<s>#{txt}</s>"
                scope.$emit 'task:complete' , attrs.task
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

app.controller 'TaskListCtrl',['taskService','$scope',(taskService,$scope)->
        self = @
            
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
            return

        $scope.$on 'task:complete',(event,task)->
            taskService.completeTask task

        
        $scope.resetTask()
        return
]
