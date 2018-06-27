let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    messageCount: {
        type: Number,
        required: true
    }
});

let User = module.exports = mongoose.model('User', userSchema);
