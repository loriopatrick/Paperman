var app = app || angular.module('app');

app.directive('markdownEditor', function () {
    return {
        restrict: 'E',
        replace: true,
//        link: function (scope) {
//            scope.lines = [];
//
//            scope.onChange = function (startLine, endLine, text) {
//                var update = text.split('\n');
//                var command = [startLine, endLine - startLine + 1];
//                for (var i = 0; i < update.length - 1; ++i) {
//                    command.push(update[i]);
//                }
//                if (update[update.length - 1].length) {
//                    command.push(update[update.length - 1]);
//                }
//                scope.lines.splice.apply(scope.lines, command);
//            };
//        },
        controller: function ($scope) {
            $scope.lines = [];
            $scope.onChange = function (startLine, endLine, text) {
                var update = text.split('\n');
                var command = [startLine, endLine - startLine + 1];
                for (var i = 0; i < update.length - 1; ++i) {
                    command.push(buildLineObj(update[i]));
                }
                if (update[update.length - 1].length) {
                    command.push(buildLineObj(update[update.length - 1]));
                }
                $scope.lines.splice.apply($scope.lines, command);
            };

            var id = 0;
            function buildLineObj(text) {
                return {id: id++, text: text};
            }
        },
        template: '<div><editor on-change="onChange" style="width: 50%; float: left;"></editor>' +
            '<div class="markdown-editor-dir" lines="lines" style="width: 50%; float: left;">' +
            '<div ng-repeat="line in lines">{{line.text}}</div>' +
            '</div></div>'
    };
});