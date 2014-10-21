var app = app || angular.module('app');

app.directive('editor', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'lines': '=',
            'onChange': '=',
            'cursor': '='
        },
        link: function (scope, element) {
            var editor = new CodeMirror(element[0], {
                mode: 'markdown',
                lineNumbers: true,
                theme: 'default'
            });

            CodeMirror.on(editor, 'change', function (editor, change) {
                scope.$apply(function () {
                    var doc = editor.getDoc();
                    scope.lines = doc.children[0].lines;
                    scope.onChange(change.from.line, change.to.line);
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