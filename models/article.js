var mongoose = require ('mongoose');

//article schema
var schema = mongoose.schema;
var articleSchema = new schema({
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
        type: schema.types.objectId, 
        ref: "Comment"
    }]
})

var article = mongoose.model("article", articleSchema);
module.exports = article;
