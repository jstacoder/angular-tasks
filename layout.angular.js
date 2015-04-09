'use strict';
var app;

app = angular.module('layout.tools.app', []);

app.directive('container', [
  function() {
    var cfg;
    cfg = {
      restrict: "E",
      replace: true,
      transclude: true,
      template: '<div ng-class={"container-fluid":fluid,container:!fluid}>' + '<ng-transclude></ng-transclude>' + '</div>',
      scope: {
        fluid: "="
      }
    };
    return cfg;
  }
]);

app.directive('row'[function() {
  var cfg;
  cfg = {
    restrict: "E",
    replace: true,
    scope: true,
    transclude: true,
    template: '<div class=row><ng-transclude></ng-transclude></div>'
  };
  return cfg;
}]);

app.directive('column', [
  function() {
    var cfg;
    cfg = {
      restrict: "E",
      scope: true,
      transclude: true,
      replace: true,
      template: '<div class="{{ cls }}"><ng-transclude></ng-transclude></div>',
      link: function(scope, ele, attrs) {
        console.log(attrs);
        Object.defineProperty(scope, 'cls', {
          get: function() {
            console.log('getting');
            return scope._cls;
          },
          set: function(val) {
            console.log('setting', val);
            return scope._cls = val;
          }
        });
        scope._class = function() {
          var a, _i, _len;
          scope.cls = '';
          for (_i = 0, _len = attrs.length; _i < _len; _i++) {
            a = attrs[_i];
            console.log(a, attrs[a]);
            scope.cls += "col-" + a + "-" + attrs[a] + " ";
          }
          return scope.cls;
        };
        scope._class();
      }
    };
    return cfg;
  }
]);
