var express = require('express')
	, http = require('http')
	, less = require('less-middleware')
	, simulator = require('./simulator/simulator')()
	, app = express()
	, faye = require('faye');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

//setup express
app.set('views', __dirname + '/client/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.argv[2] === 'production' ? 80 : 8080);
app.set('X-Frame-Options', 'SAMEORIGIN, GOFORIT');
app.use(express.favicon());
app.use(express.compress());
app.use(less({
    dest: __dirname + '/client/css',
    src: __dirname + '/client/less',
    prefix: '/css',
    compress: true
}));

//resources
app.use('/json', express.static(__dirname + '/client/json'));
app.use('/js/vendor', express.static(__dirname + '/client/components'));
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/css'));
app.use('/img', express.static(__dirname + '/client/img'));
app.use('/template', express.static(__dirname + '/client/template'));

//routes
app.get('/', function(req, res) {
    res.render('list.html');
});

app.get('/list', function(req, res) {
    res.render('list.html');
});

app.get('/simulator', function(request, response) {
	var x = request.query.x.split(',').map(function(s) {return parseFloat(s);});
	var u = request.query.u.split(',').map(function(s) {return parseFloat(s);});
	var d = request.query.d.split(',').map(function(s) {return parseFloat(s);});
	
	simulator.single(x, u, d, function(error, x1, glucose, insulin) {
		if (error) {
			response.write(error);
			response.end();
			return;
		}

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({x:x1, glucose: glucose, insulin: insulin}));
  	response.end();
	});
});

//serve 
var server = http.createServer(app);

bayeux.attach(server);

server.listen(app.get('port'), function(){
  console.log("AB server listening on port " + app.get('port'));
});
