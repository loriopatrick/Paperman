var app = app || angular.module('app');

app.directive('markdownEditor', function ($sce) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope) {
            scope.lines = [];
            scope.cursor = {line: 0, ch: 0};
            scope.handleLine = function (line) {
                if (line && line.text.length) {
                    line.html = $sce.trustAsHtml(toHtml(line.text));
                }
            };

            function process(string, operators) {
                for (var i = 0; i < operators.length; ++i) {
                    var regex = operators[i][0];
                    var operation = operators[i][1];

                    var res = string.match(regex);
                    if (!res) continue;

                    return process(string.substr(0, res.index), operators)
                        + operation(res[1], res[2], res[3])
                        + process(string.substr(res.index + res[0].length), operators);
                }

                return string;
            }

            var EQUATION_REGEX = /\$\[(.+)\]/;
            var equationCache = {};
            function mathquill(text) {
                if (text in equationCache) {
                    return equationCache[text];
                }
                var item = $('<span>' + text + '</span>').mathquill();
                equationCache[text] = item.text().length == 2 ? text : item.prop('outerHTML');
                return equationCache[text];
            }

            var BOLD_REGEX = /\*\*(.+)\*\*/;
            function bold(text) {
                return '<strong>' + text + '</strong>';
            }

            var ITALICS_REGEX = /\*(.+)\*/;
            function italic(text) {
                return '<span style="font-style: italic;">' + text + '</span>';
            }

            var HEADER_REGEX = /^(#+)(.*)/;
            function header(header, text) {
                var tag = 'h' + header.length + '>';
                return '<' + tag + text + '</' + tag;
            }

            var TAG_REGEX = /\`(.*)\`/;
            function tag(text) {
                return '<span class="label label-primary">' + text + '</span>';
            }

            var operators = [
                [EQUATION_REGEX, mathquill],
                [BOLD_REGEX, bold],
                [ITALICS_REGEX, italic],
                [HEADER_REGEX, header],
                [TAG_REGEX, tag]
            ];

            function toHtml(text) {
                return process(text, operators);
            }

            var newLine = $sce.trustAsHtml('<br/>');
            scope.blank = function (line) {
                if (!line.text.length) return newLine;
                return line.html;
            }
        },
        template: '<div><editor lines="lines" cursor="cursor" handle-line="handleLine" style="width: 50%; float: left;"></editor>' +
            '<div class="markdown-editor-dir" style="width: 50%; float: left;">' +
            '<div class="line" ng-repeat="line in lines" ' +
            'ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="blank(line)">' +
            '{{line.text}}' +
            '</div>' +
            '</div></div>'
    };
});