var mongoose = require ('mongoose');

//article schema
var Schema = mongoose.Schema;
var CommentSchema = new Schema({
    name: {
        type: String,
    },
    body: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    },
})

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
