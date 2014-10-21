var app = app || angular.module('app');

app.directive('editor', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'lines': '=',
            'onChange': '='
        },
        link: function (scope, element) {
            var editor = new CodeMirror(element[0], {
                value: '',
                mode: 'markdown',
                lineNumbers: true
            });

            var ref = editor.getDoc().children[0].lines;

            CodeMirror.on(editor, 'change', function (editor, change) {
                scope.$apply(function () {
                    scope.lines = editor.getDoc().children[0].lines;
                    scope.onChange(change.from.line, change.to.line);
                });
            });
        },
        template: '<div></div>'
    }
});