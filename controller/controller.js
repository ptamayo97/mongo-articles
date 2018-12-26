var axios = require("axios");
var cheerio = require("cheerio");
var express = require("express");
var router = express.Router();

// Require all models
var db = require("../models");

router.get("/scrape", function(req, res) {
  var url = "https://uncrate.com/tech/";
  axios.get(url).then(function(response) {
    var $ = cheerio.load(response.data);
    $(".copy-wrapper").each(function(i, element) {
      var result = {};
      // result._id = i;
      result.headline = $(this)
        .children("h1")
        .text();
      result.summary = $(this)
        .children("p")
        .text();
      result.url = $(this)
        .children("h1")
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err.message);
        });
      console.log(result);
    });
  });

  res.send("Scrape Complete");
});

router.get("/", function(req, res) {
  // res.render("index");
  db.Article.find({})
    .then(function(dbArticle) {
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's comment
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
router.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.comment
    .create(req.body)
    .then(function(dbcomment) {
      // If a comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new comment
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { comment: dbcomment._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

module.exports = router;
