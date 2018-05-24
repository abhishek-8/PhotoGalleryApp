var mongoose = require('mongoose');

var AlbumSchema = new mongoose.Schema({

    name: {
        type: String
    },
    desc: {
        type: String
    },
    privacy: {
        type: String
    },
    cover: {
        type: String
    },
    photos: [{
        type: String
    }]

});

var Album = mongoose.model('Album', AlbumSchema);
module.exports = Album;