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

            var EQUATION_REGEX = /\$\[([^\]]+)\]/;
            var equationCache = {};

            function mathquill(text) {
                console.log('mathquill', text);
                if (text in equationCache) {
                    return equationCache[text];
                }
                var item = $('<span>' + text + '</span>').mathquill();
                equationCache[text] = item.text().length == 2 ? text : item.prop('outerHTML');
                return equationCache[text];
            }

            var BOLD_REGEX = /(\*\*)(?!\s)([^(\*\*)]+)\*\*/;

            function bold(_, text) {
                console.log('bold', arguments);
                return '<strong>' + text + '</strong>';
            }

            var BOLD_ITALICS_REGEX = /(\*\*\*)(?!\s)([^(\*\*\*)]+)\*\*\*/;

            function boldItalic(_, text) {
                console.log('bold', arguments);
                return '<strong style="font-style: italic;">' + text + '</strong>';
            }

            var ITALICS_REGEX = /(\*)(?!\s)([^\*]+)\*/;

            function italic(_, text) {
                return '<span style="font-style: italic;">' + text + '</span>';
            }

            var HEADER_REGEX = /^(#+)(.*)/;

            function header(header, text) {
                var tag = 'h' + header.length + '>';
                return '<' + tag + text + '</' + tag;
            }

            var TAG_REGEX = /\`([^\`]+)\`/;

            function tag(text) {
                return '<span class="label label-primary">' + text + '</span>';
            }

            var BULLET_REGEX = /^(([\*-]\s)+)(.*)/;

            function bullet(bullets, _, text) {
                var indents = bullets.length / 2;
                var html = '';
                for (var i = 0; i < indents; ++i) {
                    html += i % 2 == 0 ? '<span style="padding-right: 10px;">&#8212;</span>'
                        : '<span style="padding: 0 10px 0 5px;">&#8212;</span>';
                }
                html += process(text, operators);
                return html;
            }

            var operators = [
                [EQUATION_REGEX, mathquill],
                [BOLD_ITALICS_REGEX, boldItalic],
                [BOLD_REGEX, bold],
                [ITALICS_REGEX, italic],
                [HEADER_REGEX, header],
                [TAG_REGEX, tag],
                [BULLET_REGEX, bullet]
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
        templateUrl: 'directives/markdownEditor.html'
//        template: '<div><editor lines="lines" cursor="cursor" handle-line="handleLine" style="width: 50%; float: left;"></editor>' +
//            '<div class="markdown-editor-dir" style="width: 50%; float: left;">' +
//            '<div class="line" ng-repeat="line in lines" ' +
//            'ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="blank(line)">' +
//            '{{line.text}}' +
//            '</div>' +
//            '</div></div>'
    };
});