var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var express = require('express');

var app = express();

app.use('/', express.static(path.join(__dirname, '../webapp')));
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use(require('body-parser')());
app.listen(8888);

app.post('/download', function (req, res) {
    makePdf(req.body.html, function (err, file) {
        res.send('/pdf/' + file + '.pdf');
    })
});

function makePdf(html, callback) {
    var content = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8">'
        + '<title></title><link rel="stylesheet" href="../../webapp/lib/bootstrap/css/bootstrap.min.css"/>'
        + '<link rel="stylesheet" href="../../webapp/lib/mathquill/mathquill.css"/>'
        + '<link rel="stylesheet" href="../../webapp/app.css"/><style>.currentLine{background: none;}'
        + '</style></head><body>' + html + '</body></html>';

    var file = 'pdf-' + Math.random();

    fs.writeFile('html/' + file + '.html', content, function (err) {
        if (err) return callback(err);
        var process = exec('wkhtmltopdf ' + ['html/' + file + '.html', 'pdf/' + file + '.pdf'].join(' '), function (err) {
            if (err) return callback(err);
            callback(err, file);
        });
    });
}

//makePdf('<!-- ngRepeat: line in lines --><div class="line ng-binding ng-scope" ng-dblclick="jumpToLine($index)" ng-repeat="line in lines" ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="blank(line)"><span class="mathquill-rendered-math hasCursor" mathquill-block-id="23"><span class="selectable">$x^2+4$</span><var mathquill-command-id="24">x</var><sup class="non-leaf" mathquill-command-id="26" mathquill-block-id="28"><span mathquill-command-id="27">2</span></sup><span mathquill-command-id="30" class="binary-operator">+</span><span mathquill-command-id="32">4</span></span></div><!-- end ngRepeat: line in lines --><div class="line ng-binding ng-scope" ng-dblclick="jumpToLine($index)" ng-repeat="line in lines" ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="blank(line)"><br></div><!-- end ngRepeat: line in lines --><div class="line ng-binding ng-scope currentLine" ng-dblclick="jumpToLine($index)" ng-repeat="line in lines" ng-class="{\'currentLine\':$index==cursor.line}" ng-bind-html="blank(line)"><h1> fdsa</h1></div><!-- end ngRepeat: line in lines -->', console.log);