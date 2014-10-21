var app = app || angular.module('app');

app.directive('markdownEditor', function ($sce) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope) {
            var equationCache = {};
            var converter = new Showdown.converter({ extensions: [function () {
                return [
                    {
                        type: 'lang',
                        regex: '(~D){2}(.*?)(~D){2}',
                        replace: function (match, prefix, content) {
                            if (content in equationCache) {
                                return equationCache[content];
                            }

                            var item = $('<span>' + content + '</span>').mathquill();
                            equationCache[content] = item.text().length == 2 ? 'ERROR' : item.prop('outerHTML');
                            return equationCache[content];
                        }
                    }
                ]
            }]});

            scope.lines = [];
            scope.cursor = {line: 0, ch: 0};

            scope.onChange = function (startLine, endLine) {
                for (var i = startLine; i < Math.min(endLine + 1, scope.lines.length); ++i) {
                    prepLine(scope.lines[i - 1], scope.lines[i], scope.lines[i + 1], i);
                }
            };

            var mId = 0;
            var newLine = $sce.trustAsHtml('<br/>');
            function prepLine(prevLine, line, nextLine, index) {
                function getStyleLine(line) {
                    if (!line) return '';
                    if (line.text.indexOf('---') == 0 || line.text.indexOf('===') == 0) {
                        return '\n' + line.text;
                    }
                }

                line.mId = mId++;
                if (line.text.indexOf('===') == 0 || line.text.indexOf('---') == 0) {
                    prepLine(null, prevLine, line);
                }
                if (line.text.indexOf('===') == 0) {
                    line.html = $sce.trustAsHtml(' ');
                    return;
                }
                line.html = $sce.trustAsHtml(converter.makeHtml((line.text || '') + (getStyleLine(nextLine) || '')));
            }

            scope.lineMod = function (html) {
                if (!html) return newLine;
                return html;
            }
        },
        template: '<div><editor lines="lines" cursor="cursor" on-change="onChange" style="width: 50%; float: left;"></editor>' +
            '<div class="markdown-editor-dir" style="width: 50%; float: left;">' +
            '<div class="line" ng-repeat="line in lines" ' +
            'ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="lineMod(line.html)"><br/></div>' +
            '</div></div>'
    };
});