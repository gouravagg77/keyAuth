var mongoose = require("mongoose");

var featureSchema = new mongoose.Schema({
    features: [Number],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
});

module.exports = mongoose.model("Features", featureSchema);