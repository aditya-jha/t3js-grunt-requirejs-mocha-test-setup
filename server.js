var express = require('express');
var app = express();

var PORT = 3000;

app.set('views', __dirname + '/tests');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
app.get('/', function(req, res) {
   res.render('testRunner', {});
});

app.listen(PORT, function() {
  console.log('Server is running on PORT %d', PORT);    
});

