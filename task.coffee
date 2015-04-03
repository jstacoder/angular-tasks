'use strict'

forEach = angular.forEach
element = angular.element

app = angular.module 'task.app',[]



app.factory 'ids',[() ->
    [0,1,2]
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
        rtn = null
        forEach self.tasks,(itm)->
            if itm.id == id
                rtn = itm
        return rtn
    
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
        forEach self.tasks,(itm)->
            if itm.id == id
                return itm
        return null
        
    self.getAllTasks = ()->
        return self.tasks
    return
]


app.factory 'reopenCompleteTask', ['completeTaskService','taskService',(completeTaskService,taskService)->
    return (id)->
        task = completeTaskService.getTask id
        completeTaskService.removeTask task
        taskService.addTask task.title,task.content,task.due        
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
                console.log 'id: ',id
                
                console.log 'adding: ',id
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

app.controller 'TaskListCtrl',['completeTaskService','taskService','$scope','ids',(completeTaskService,taskService,$scope,ids)->
        self = @
        
        $scope.ids = ids;
            
            
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
