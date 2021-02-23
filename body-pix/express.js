var express = require('express');
var app = express();
 
app.use('/public', express.static('public'));
 
app.get('/', function (req, res) {
   res.send('Hello World from NodeJS service!');
})

// http://127.0.0.1:8080/get?first=joe&last=ge
app.get('/get', function (req, res) {

	var response = {
		"first_name":req.query.first,
		"last_name":req.query.last
	};
	console.log(response);
	res.end(JSON.stringify(response));
})

 
var server = app.listen(80, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
