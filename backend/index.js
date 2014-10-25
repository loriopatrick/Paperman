var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var express = require('express');

var app = express();

app.use('/', express.static(path.join(__dirname, '../webapp')));
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use(require('body-parser').json());
app.listen(8888);

var toDelete = [];

app.post('/download', function (req, res) {
    makePdf(req.body.html, function (err, file) {
        var url = '/pdf/' + file + '.pdf';
        res.send(url);
        toDelete.push({path: path.join(__dirname, url), time: new Date().getTime() + 1000*3600});
    })
});

// delete old items
setInterval(function () {
    var now = new Date().getTime();
    while (toDelete.length) {
        if (toDelete[0].time < now) {
            fs.unlink(toDelete.shift().path);
        } else {
            break;
        }
    }
}, 1000*60*10);

function makePdf(html, callback) {
    var content = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8">'
        + '<title></title><link rel="stylesheet" href="../../webapp/lib/bootstrap/css/bootstrap.min.css"/>'
        + '<link rel="stylesheet" href="../../webapp/lib/mathquill/mathquill.css"/>'
        + '<link rel="stylesheet" href="../../webapp/app.css"/>'
        + '<link rel="stylesheet" href="../pdf.css"/>'
        + '</head><body>' + html + '</body></html>';

    var file = 'pdf-' + Math.random();

    fs.writeFile('html/' + file + '.html', content, function (err) {
        if (err) return callback(err);
        var process = exec('wkhtmltopdf ' + ['html/' + file + '.html', 'pdf/' + file + '.pdf'].join(' '), function (err) {
            if (err) return callback(err);
            callback(err, file);
            fs.unlink('html/' + file + '.html');
        });
    });
}