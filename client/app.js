const form = document.querySelector('form')
const channelnameInput = document.querySelector('.channelname')
const usernameInput = document.querySelector('.username')
const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')
const URL = 'http://localhost:'
const PORT = 3000
const apiBase = `${URL}${PORT}`
// const proxy = 'https://cors-anywhere.herokuapp.com/' // for localhost use

let currentlyTracking = false
form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!currentlyTracking) {
        startButton.style.display = 'none'
        stopButton.style.display = 'inline-block'

        const userInput = {
            channelname: channelnameInput.value,
            username: usernameInput.value
        }

        currentlyTracking = true

        await sendUserinput(userInput)
        getMessages()

    } else {
        startButton.style.display = 'inline-block'
        stopButton.style.display = 'none'
        currentlyTracking = false
    }
})

async function sendUserinput(userInput) {
    const { channelname } = userInput
    const { username } = userInput

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
}

async function getMessages() {
    const response = await fetch(`${apiBase}/getMessages`)
    const message = await response.json()

    console.log(message)
    if (currentlyTracking) {
        setTimeout(getMessages, 10000)
    }
}