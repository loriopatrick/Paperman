var app = app || angular.module('app');

app.directive('editor', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'onChange': '='
        },
        link: function (scope, element) {
            var editor = new CodeMirror(element[0], {
                value: '',
                mode: 'text/x-markdown',
                lineNumbers: true
            });

            CodeMirror.on(editor, 'change', function (editor, change) {
                scope.$apply(function () {
                    if (scope.onChange) {
                        var startLine = change.from.line;
                        var endLine = change.to.line;
                        var update = editor.getRange({line: startLine, ch: 0}, {line: endLine + 1, ch: 0});
                        scope.onChange(startLine, endLine, update, change.origin == '+input');
                    }
                });
            });
        },
        template: '<div></div>'
    }
});