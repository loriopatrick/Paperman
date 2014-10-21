var app = app || angular.module('app');

app.directive('markdownEditor', function () {
    return {
        restrict: 'E',
        replace: true,
        controller: function ($scope, $sce) {
            var equations = {};

            function exFn() {
                return [
                    {
                        type: 'lang',
                        regex: '(~D){2}(.*?)(~D){2}',
                        replace: function (match, prefix, content, postfix) {
                            if (content in equations) {
                                return equations[content];
                            }

                            var item = $('<span>' + content + '</span>').mathquill();
                            equations[content] = item.text().length == 2? 'ERROR' : item.prop('outerHTML');
                            return equations[content];
                        }
                    }
                ]
            }

            var converter = new Showdown.converter({ extensions: [exFn] });
            $scope.lines = [];

            $scope.onChange = function (startLine, endLine) {
                for (var i = startLine; i < Math.min(endLine + 1, $scope.lines.length); ++i) {
                    prepLine($scope.lines[i - 1], $scope.lines[i], $scope.lines[i + 1]);
                }
            };

            var mId = 0;

            function getStyleLine(line) {
                if (!line) return '';
                if (line.text.indexOf('---') == 0 || line.text.indexOf('===') == 0) {
                    return '\n' + line.text;
                }
            }

            function prepLine(prevLine, line, nextLine) {
                line.mId = mId++;

                if (line.text.indexOf('===') == 0 || line.text.indexOf('---') == 0) {
                    prepLine(null, prevLine, line);
                }

                if (line.text.indexOf('===') == 0) {
                    line.html = $sce.trustAsHtml(' ');
                    return;
                }

                line.html = $sce.trustAsHtml(converter.makeHtml(line.text + getStyleLine(nextLine)));
            }

            var newLine = $sce.trustAsHtml('<br/>');

            $scope.lineMod = function (html) {
                if (!html) return newLine;
                return html;
            }
        },
        template: '<div><editor lines="lines" on-change="onChange" style="width: 50%; float: left;"></editor>' +
            '<div class="markdown-editor-dir" style="width: 50%; float: left;">' +
            '<div ng-repeat="line in lines" ng-bind-html="lineMod(line.html)"><br/></div>' +
            '</div></div>'
    };
});