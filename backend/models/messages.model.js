const mongoose = require('mongoose');
const User = require('./user.js');

const messageSchema = new mongoose.Schema({
    message: { 
        text: { 
            type: String,
            required: true,
         },
        },
         users:Array,
         sender:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required:true,
         }
    ,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
