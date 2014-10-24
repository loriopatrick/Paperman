var app = app || angular.module('app');

app.directive('editor', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'lines': '=',
            'handleLine': '=',
            'cursor': '='
        },
        link: function (scope, element) {
            var editor = new CodeMirror(element[0], {
                mode: 'markdown',
                theme: 'default',
                lineWrapping: true
            });

            CodeMirror.on(editor, 'change', function (editor, change) {
                scope.$apply(function () {
                    var doc = editor.getDoc();
                    scope.lines = doc.children[0].lines;

                    for (var i = change.from.line; i < change.to.line + change.text.length; ++i) {
                        scope.handleLine(scope.lines[i]);
                    }
                });
            });

            CodeMirror.on(editor, 'cursorActivity', function (editor) {
                scope.$apply(function () {
                    var doc = editor.getDoc();
                    var cursor = doc.getCursor();
                    scope.cursor.line = cursor.line;
                    scope.cursor.ch = cursor.ch;
                });
            });
        },
        template: '<div></div>'
    }
});