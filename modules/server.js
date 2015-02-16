var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    common = require('./common');

exports.server = function (port) {
    var server = http.createServer(function (req, res) {

        var inputUrl = req.headers.host + req.url,
            parseUrl = url.parse(inputUrl),
            contentType = common.getContentType(path.extname(parseUrl.pathname)),
            pathURL = parseUrl.pathname == '/' ? '/index.html' : parseUrl.pathname;

        pathURL = pathURL.replace('/', '');
        pathURL = path.resolve(__dirname, '../', pathURL);

        fs.exists(pathURL, function (exists) {
            if (exists)
                res.writeHead(200, {'Content-Type': contentType});
            else {
                pathURL = './404.html';
                res.writeHead(404, {'Content-Type': 'text/html'});
            }
            fs.createReadStream(pathURL).pipe(res);
        });


    }).listen(port);

    return server;
};