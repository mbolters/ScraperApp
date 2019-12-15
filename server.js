var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var express = require('express');
var app = express();

//connect to public folder 
app.use(express.static(process.cwd() + "/public"));

//connect expresshandlebars 
var exhbs = require('express-handlebars')

//set app engine to main
app.engine("handlebars", exhbs({ defaultLayout: 'main'}));
app.set("view engine", "handlebars");


//mongoose connection
mongoose.connect("mongodb://localhost/scraped_news");
var db = mongoose.connection;

//error function for mongoose connection
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(){
    console.log("Connected to Mongoose");
});

//set port connection and listener
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log('Listening on PORT ' + port);
});

