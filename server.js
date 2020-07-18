if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.get('/getMessages', async (req, res) => {
    console.log('GET REQUEST RECIEVED 👾')

    await ChatMessage.find((err, msg) => {
        if (err) return console.error(err)
        res.json(msg)
    })

    console.log('GET REQUEST PROCESSED ✅')
})

app.post('/insertMsg', (req, res) => {
    console.log('POST REQUEST RECIEVED')

    const { channelname } = req.body
    const { username } = req.body
    startListening(channelname, username)

    console.log('POST REQUEST PROCESSED')
    res.json('POST REQUEST PROCESSED 📨')
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

const MONGO_URI = process.env.MONGO_URI
const mongoose = require('mongoose')
const ChatMessage = require('./models')

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DATABASE CONNECTED!')
})

// ChatMessage.deleteMany({}, () => {
//     console.log('bye')
// })

const tmi = require('tmi.js')

function startListening(channelname, username) {
    const client = new tmi.Client({
        connection: {
            secure: true,
            reconnect: true
        },
        channels: [`${channelname.toLowerCase()}`]
    })

    client.connect();
    client.on('message', async (channel, tags, message, self) => {
        if (tags['display-name'].toLowerCase() === username.toLowerCase()) {
            message = {
                username: username,
                channelname: channelname,
                message: message
            }
            insertMessageInDB(message)
        }
    })
}

async function insertMessageInDB(message) {

    chatMessage = new ChatMessage({
        username: message.username,
        channelname: message.channelname,
        message: message.message
    })

    await chatMessage.save((err) => {
        if (err) return console.error(err)
        console.log(chatMessage)
    })
}

