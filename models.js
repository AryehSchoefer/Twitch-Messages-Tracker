const mongoose = require('mongoose')

const Schema = mongoose.Schema

const chatMsgSchema = new Schema({
    username: { type: String, required: true },
    channelname: { type: String, required: true },
    message: { type: String },
    date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ChatMessage', chatMsgSchema)