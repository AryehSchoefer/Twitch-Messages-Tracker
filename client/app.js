const form = document.querySelector('form')
const channelnameInput = document.querySelector('.channelname')
const usernameInput = document.querySelector('.username')
const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')
const messagesSection = document.querySelector('.messages')
const serverError = document.getElementById('server-error')
const URL = 'http://localhost:'
const PORT = 3000
const apiBase = `${URL}${PORT}`
const userMemory = []

let currentlyTracking = false
form.addEventListener('submit', async (event) => {
    event.preventDefault()
    userMemory.length = 0
    serverError.style.display = 'none'

    if (!currentlyTracking) { // start tracking button
        startButton.style.display = 'none'
        stopButton.style.display = 'inline-block'

        const userInput = {
            channelname: channelnameInput.value,
            username: usernameInput.value
        }

        currentlyTracking = true

        userMemory.push(userInput)
        await sendUserinput(userInput)
        getMessages()
    } else { // stop tracking button
        startButton.style.display = 'inline-block'
        stopButton.style.display = 'none'
        currentlyTracking = false
    }
})

async function sendUserinput(userInput) {
    const { channelname } = userInput
    const { username } = userInput

    try {
        const response = await fetch(`${apiBase}/insertMsg`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                channelname: channelname,
                username: username
            })
        })
        const chatMessages = await response.json()
        return chatMessages
    } catch (err) {
        serverError.style.display = 'block'
        startButton.style.display = 'inline-block'
        stopButton.style.display = 'none'
        return err
    }
}

async function getMessages() {
    const { channelname } = userMemory[0]
    const { username } = userMemory[0]
    console.log(`${channelname}, ${username}`)

    const response = await fetch(`${apiBase}/messages`, {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            channelname: channelname,
            username: username
        })
    })
    const messages = await response.json()
    while (messagesSection.firstChild) {
        messagesSection.removeChild(messagesSection.firstChild)
    }
    messages.reverse()
    messages.forEach(message => {
        const messageBox = document.createElement('div')
        messageBox.setAttribute('class', 'message')

        const messageInfo = document.createElement('h3')
        messageInfo.setAttribute('class', 'messageInfo')
        messageInfo.textContent = `${message.username} in ${message.channelname}'s chat`

        const chatMessage = document.createElement('p')
        chatMessage.setAttribute('class', 'chatmessage')
        chatMessage.textContent = message.message

        const dateInfo = document.createElement('p')
        dateInfo.setAttribute('class', 'date')
        const date = new Date(message.date)
        dateInfo.textContent = date.toUTCString()

        messageBox.appendChild(messageInfo)
        messageBox.appendChild(chatMessage)
        messageBox.appendChild(dateInfo)

        messagesSection.appendChild(messageBox)
    })

    console.log(messages)
    if (currentlyTracking) {
        setTimeout(getMessages, 10000)
    }
}