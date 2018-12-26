var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Sets up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes;
var router = require("./controller/controller.js");
app.use(router);

// Connect to the Mongo DB
mongoose
  .connect(
    "mongodb://localhost/mongoHeadlines",
    { useNewUrlParser: true }
  )
  .then(function() {
    console.log("connected");
  });

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
