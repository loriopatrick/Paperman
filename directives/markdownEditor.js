var app = app || angular.module('app');

app.directive('markdownEditor', function ($sce, $timeout, $http, $window) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            'download': '=',
            'save': '=',
            'load': '='
        },
        link: function (scope, element) {
            scope.lines = [];
            scope.cursor = {line: 0, ch: 0};
            scope.handleLine = function (line, type) {
                if (line.text.length) {
                    if (type == 'equation') {
                        line.html = $sce.trustAsHtml(mathquill(line.text));
                        return;
                    }
                    line.html = $sce.trustAsHtml(toHtml(line.text));
                }
            };

            var $previewLines = $(element.find('.preview-lines')).first();

            scope.$watch('download', function (download) {
                if (!download) return;
                scope.download = false;

                var html = $previewLines.html();
                $http.post('/download', {html: html}).success(function (url) {
                    $window.open(url);
                });
            }, true);

            scope.$watch('cursor', function () {
                $timeout(function () {
                    var $currentLine = $previewLines.find('.currentLine');
                    if (!$currentLine.length || isScrolledIntoView($currentLine)) return;
                    $previewLines.scrollTop($currentLine.position().top + $previewLines.scrollTop());
                });
            }, true);

            function isScrolledIntoView($elem) {
                var docViewTop = $previewLines.scrollTop();
                var docViewBottom = docViewTop + $previewLines.height();

                var elemTop = $elem.position().top + $previewLines.scrollTop();
                var elemBottom = elemTop + $elem.height();

                return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            }

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

            var EQUATION_REGEX = /\$\$([^\$\$]+)\$\$/;

            function mathquill(text) {
                var item = $('<span>' + text + '</span>').mathquill();
                return item.text().length == 2 ? text : item.prop('outerHTML');
            }

            var BOLD_REGEX = /(\*\*)(?!\s)([^\*\*]+)\*\*/;

            function bold(_, text) {
                return '<strong>' + text + '</strong>';
            }

            var BOLD_ITALICS_REGEX = /(\*\*\*)(?!\s)([^\*\*\*]+)\*\*\*/;

            function boldItalic(_, text) {
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
                if (!line.text.trim().length) return newLine;
                return line.html;
            };
        },
        controller: function ($scope) {
            $scope.jumpToLine = function (line) {
                $scope.goToLine = line;
            };
        },
        templateUrl: 'directives/markdownEditor.html'
    };
});