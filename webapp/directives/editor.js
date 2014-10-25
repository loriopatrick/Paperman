var app = app || angular.module('app');

app.directive('editor', function ($timeout, $window) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'lines': '=',
            'handleLine': '=',
            'cursor': '=',
            'goToLine': '=',
            'save': '=',
            'load': '='
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

            $timeout(function () {
                var text = $window.localStorage.getItem('text');
                if (text) {
                    doc.setValue(text);
                } else {
                    doc.setValue('# This is Paper Man.\n\nIt\'s a latex editor with a markdown feel.\n\n' +
                        'You can write latex $$p(x)=x^2+\\frac{2}{4}$$\nYou can have **bold** *italic* and ' +
                        '***italic bold*** font.\n\nYou can create lists\n* There are also `labels`.\n* ' +
                        'Everything is extremely responsive, even for large files .\n* Try this out.\n* * ' +
                        'Double click me in the right window.\n* * Now double click me in the right window.' +
                        '\n\nNotice the Download PDF button in the top center.\n\nLet me know what you think,' +
                        ' my email is **patrick@lorio.me**\n\nEnjoy Paper Man,\nPatrick Lorio.');
                }
            }, 100);


            scope.$watch('save', function (save) {
                if (!save) return;
                scope.save = false;
                $window.localStorage.setItem('text', doc.getValue());
            });

            scope.$watch('load', function (load) {
                if (!load) return;
                scope.load = false;
                var text = $window.localStorage.getItem('text');
                doc.setValue(text);
            });

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