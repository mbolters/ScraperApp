var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/Comment");
var Article = require("../models/Article");
var Saved = require("../models/Saved");


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
            //search articles database for title and count
              Article.count({ title: result.title }, function (err, test) {
                //make sure there are 0 articles with that title in articles and saved DB
                Saved.count({ title: result.title }, function (err, saveTest) {
                    if (test === 0 && saveTest === 0) {
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
            console.log("removed all articles");
        }
    });
    res.redirect("/articles");
})

//route to find specific article by id
router.get("/readArticle/:id", function(req, res) {
  var articleId = req.params.id;
  var hbsObj = {
    article: [],
    body: []
  };
    //find article by id and grab article from link
    Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function(err, doc) {
      if (err) {
        console.log("Error: " + err);
      } else {
        hbsObj.article = doc;
        var link = doc.link;
        request(link, function(error, response, html) {
          var $ = cheerio.load(html);

          $(".l-col__main").each(function(i, element) {
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

    console.log("its trying to save");

    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content,
        article: articleId
    };

    var newComment = new Comment(commentObj);

    newComment.save(function(err, doc){
        if (err){
            console.log(err);
        } else {
            console.log(doc.id);
            console.log(articleId);

            Article.findOneAndUpdate(
                {_id: req.params.id},
                {$push: { comment: doc._id }},
                {new: true}
            ).exec(function(err, doc){
                if (err){
                    console.log(err);
                } else {
                    res.redirect("/readArticle/" + articleId);
                }
            });
        }
    });
});

// Delete comment.
router.get('/deleteComment/:comment', function(req, res) {


    Comment.findOneAndDelete(
        {_id: req.params.comment}
        ).exec(function(error, data) {
        if (error) {
            console.log(error);
        } else {
            res.redirect("/readArticle/" +  data.article);
        }
    });
});

//route to find specific article by id
router.get("/readSaved/:id", function(req, res) {
    var articleId = req.params.id;
    var hbsObj = {
      article: [],
      body: []
    };
      //find article by id and grab article from link
      Saved.findOne({ _id: articleId })
      .populate("comment")
      .exec(function(err, doc) {
        if (err) {
          console.log("Error: " + err);
        } else {
          hbsObj.article = doc;
          var link = doc.link;
          request(link, function(error, response, html) {
            var $ = cheerio.load(html);
  
            $(".l-col__main").each(function(i, element) {
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
//save article page 

router.get("/saved", function(req, res){
    Saved.find()
    .sort({ _id: -1 })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("saved", artcl);
      }
    });
});

//where user can display and add comments from mongodb database
router.get("/savedArticle/:id", function(req,res){
    
    Article.findOne(
        {
          // Using the id in the url
          _id: req.params.id
        },
        function(error, found) {
          // log any errors
          if (error) {
            console.log(error);
            res.send(error);
          }
          else {
            console.log(found);

            var savedArt = {
                title: found.title,
                link: found.link,
                comment: found.comment
            };
        
            var newSavedArt = new Saved(savedArt);

            newSavedArt.save(function(err, doc){
                if (err){
                    console.log(err);
                } else {
                    console.log(doc.id);
                    Article.findOneAndDelete(
                        {_id: req.params.id}
                        ).exec(function(error, data) {
                        if (error) {
                            console.log(error);
                        } else {
                            res.redirect("/articles");
                        }
                    });

                }
            });


          }
        }
      );
});
// Delete article.
router.get('/deleteArticle/:id', function(req, res) {

    Saved.findOneAndDelete(
        {_id: req.params.id}
        ).exec(function(error, data) {
        if (error) {
            console.log(error);
        } else {
            res.redirect("/saved");
        }
    });
});


module.exports = router;