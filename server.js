var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');

var express = require('express');
var app = express();

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

//connect to public folder 
app.use(express.static(process.cwd() + "/public"));

//connect expresshandlebars 
var exhbs = require('express-handlebars')

//set app engine to main
app.engine("handlebars", exhbs({defaultLayout: 'main'}));
app.set("view engine", "handlebars");


//mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper_news";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var db = mongoose.connection;
//error function for mongoose connection
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(){
    console.log("Connected to Mongoose");
});

var routes = require("./controller/controller.js");
app.use("/", routes);

//set port connection and listener
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log('Listening on PORT ' + port);
});

