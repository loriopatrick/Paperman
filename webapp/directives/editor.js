var app = app || angular.module('app');

app.directive('editor', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'lines': '=',
            'handleLine': '=',
            'cursor': '=',
            'goToLine': '='
        },
        link: function (scope, element) {
            var editor = new CodeMirror(element[0], {
                mode: 'markdown',
                theme: 'default',
                lineWrapping: true,
                styleActiveLine: true
            });

            scope.lines = [];

            var doc = editor.getDoc();

            scope.$watch('goToLine', function (goToLine) {
                if (goToLine !== 0 && !goToLine) return;
                editor.setCursor({line: goToLine, ch: 0});
                scope.cursor.line = goToLine;
                scope.cursor.ch = 0;
                editor.focus();
            });

            CodeMirror.on(editor, 'change', function (editor, change) {
                $timeout(function () {
                    var newLines = change.text;

                    var startText = scope.lines[change.from.line]? scope.lines[change.from.line].text : null;
                    var endText = scope.lines[change.to.line]? scope.lines[change.to.line].text : null;

                    if (startText) {
                        newLines[0] = startText.substr(0, change.from.ch) + newLines[0];
                    }

                    if (startText && change.from.line == change.to.line) {
                        newLines[newLines.length - 1] += startText.substr(change.from.ch + change.removed[0].length);
                    } else if (endText) {
                        newLines[newLines.length - 1] += endText.substr(change.to.ch);
                    }

                    var command = [change.from.line, change.removed.length];
                    for (var i = 0; i < newLines.length; ++i) {
                        command.push(buildNewLine(newLines[i]));
                    }

                    scope.lines.splice.apply(scope.lines, command);
                });
            });

            function buildNewLine(text) {
                var newLine = {text: text};
                scope.handleLine(newLine);
                return newLine;
            }

            CodeMirror.on(editor, 'cursorActivity', function (editor) {
                $timeout(function () {
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