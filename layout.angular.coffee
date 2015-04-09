'use strict'

app = angular.module 'layout.tools.app',[]

app.directive 'container',[()->
    cfg =
        restrict:"E"
        replace:true
        transclude:true
        template:'<div ng-class={"container-fluid":fluid,container:!fluid}>'+
                    '<ng-transclude></ng-transclude>'+
                    '</div>'
        scope:
            fluid:"="
    return cfg
]

app.directive 'row'[()->
    cfg =
        restrict:"E"
        replace:true
        scope:true
        transclude:true
        template:'<div class=row><ng-transclude></ng-transclude></div>'
    return cfg
]

app.directive 'column',[()->
    cfg =
        restrict:"E"
        scope:true

        transclude:true
        replace:true
        template:'<div class="{{ cls }}"><ng-transclude></ng-transclude></div>'
        link:(scope,ele,attrs)->
            console.log attrs
            Object.defineProperty scope,'cls',
                get:()->
                    console.log 'getting'
                    return scope._cls
                set:(val)->
                    console.log 'setting',val
                    scope._cls = val

            scope._class = ()->
                scope.cls = ''
                for a in attrs
                    console.log a,attrs[a]
                    scope.cls += "col-#{a}-#{attrs[a]} "
                return scope.cls
            scope._class()
            return
    return cfg
]
