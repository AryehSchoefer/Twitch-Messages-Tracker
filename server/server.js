if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.post('/messages', async (req, res) => {
    console.log('GET REQUEST RECIEVED 👾')

    const { channelname } = req.body
    const { username } = req.body

    await ChatMessage.find({ username: username.toLowerCase(), channelname: channelname.toLowerCase() }, (err, msg) => {
        if (err) return console.error(err)
        res.json(msg)
    })

    console.log('GET REQUEST PROCESSED ✅')
    console.log(`CHANNELNAME: ${channelname}, USERNAME: ${username} \n`)
})

app.post('/insertMsg', (req, res) => {
    console.log('POST REQUEST RECIEVED')

    const { channelname } = req.body
    const { username } = req.body
    startListening(channelname, username)

    console.log('POST REQUEST PROCESSED \n')
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

let currentlyTrackingList = []
function startListening(channelname, username) {
    const userInput = {
        channelname: channelname,
        username: username
    }

    if (!currentlyTracking(userInput)) {
        currentlyTrackingList.push({
            channelname: channelname,
            username: username
        })

        const client = new tmi.Client({
            connection: {
                secure: true,
                reconnect: true
            },
            channels: [`${channelname.toLowerCase()}`]
        })

        client.connect()
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
    } else {
        console.log(`ALREADY TRACKING! ${currentlyTrackingList}`)
    }
}

async function insertMessageInDB(message) {
    chatMessage = new ChatMessage({
        username: message.username.toLowerCase(),
        channelname: message.channelname.toLowerCase(),
        message: message.message
    })

    await chatMessage.save((err) => {
        if (err) return console.error(err)
        console.log(chatMessage)
    })
}

function currentlyTracking(userInput) {
    for (let i = 0; i < currentlyTrackingList.length; i++) {
        let { channelname } = currentlyTrackingList[i]
        let { username } = currentlyTrackingList[i]
        if (channelname === userInput.channelname && username === userInput.username) {
            return true
        }
    }
    return false
}