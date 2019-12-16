var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.redirect("/articles");
});

router.get("/scrape", function(req, res) {
  request("http://www.theverge.com", function(error, response, html) {
    var $ = cheerio.load(html);
    var titlesArray = [];

    $(".c-entry-box--compact__title").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      if (result.title !== "" && result.link !== "") {
        if (titlesArray.indexOf(result.title) == -1) {
          titlesArray.push(result.title);

          Article.count({ title: result.title }, function(err, test) {
            if (test === 0) {
              var entry = new Article(result);

              entry.save(function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
            }
          });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }
    });
    res.redirect("/");
  });
});
router.get("/articles", function(req, res) {
  Article.find()
    .sort({ _id: -1 })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("index", artcl);
      }
    });
});

router.get("/articles-json", function(req, res) {
  Article.find({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

//endpoint with empty database of no articles
router.get("/clearAll", function(req,res){
    Article.remove({}, function(err, doc){
        if (err){
            console.log(err);
        } else {
            console.log("remove all articles");
        }
    });
    res.redirect("/articles-json");
})

//route to find specific article by id
router.get("/readArticle/:id", function (req, res){
    var articleId = req.param.id;
    var hbsObj = {
        article: [],
        body: []
    };
    //find article by id and grab article from link
    Article.findOne({_id: articleId})
    .populate("comment")
    .exec(function(err, doc){
        if (err){
            console.log("Error: " + err);
        } else {
            hbsObj.article = doc;
            var link = doc.link;
            request(link, function(error, response, html){
                var $ = cheerio.load(html);

                $(".1-col_main").each(function(i, element){
                    hbsObj.body = $(this)
                    .children(".c-entry-content")
                    .children("p")
                    .text();

                    res.render("article", hbsObj);
                    return false;
                });
            });
        }
    });
});

//where user can display and add comments from mongodb database
router.post("/comment/:id", function(req,res){
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc){
        if (err){
            console.log(err);
        } else {
            console.log(doc.id);
            console.log(articleId);
        }
    })
})

module.exports = router;