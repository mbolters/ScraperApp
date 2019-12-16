var mongoose = require ("mongoose");

//article schema
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    //comment is an array
    comment: [{
        type: Schema.Types.ObjectId, 
        ref: "Comment"
    }]
})

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;

