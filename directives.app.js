'use strict';

var app;

app = angular.module('tzp.directives.app', []);

app.directive('sideBox', [
  function() {
    var cfg;
    cfg = {
      restrict: 'EA',
      scope: {
        title: "@"
      },
      transclude: true,
      
      template: '<div class="sidebox">'+
        '<div class="content">'+
          '<h2 class="page-header">{{ title }}</h2>'+
            '<ng-transclude></ng-transclude>'+
            '</div>'+
          '</div>'
    };
    return cfg;
  }
]);
