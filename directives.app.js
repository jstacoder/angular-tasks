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
      replacr: true,
      template: '<div class="sidebox"> <div class="content"> <h2 class="header">{{ title }}</h2> <span class="content" ng-transclude> </span> </div> </div>'
    };
    return cfg;
  }
]);
