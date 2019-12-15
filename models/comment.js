var mongoose = require ('mongoose');

//article schema
var schema = mongoose.schema;
var commentSchema = new schema({
    name: {
        type: String,
    },
    body: {
        type: String,
        required: true
    },
})

var comment = mongoose.model("comment", commentSchema);
module.exports = comment;
