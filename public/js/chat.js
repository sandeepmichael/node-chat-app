const socket = io()

//elements
const $messageForm = document.querySelector('#form-message')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendlocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})
//autoscrolling
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    } 
}

socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('ddd -MMM h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (messageurl) => {
    console.log(messageurl)
    const html = Mustache.render(locationmessagetemplate, {
        username:messageurl.username,
        url : messageurl.url,
        createdAt : moment(messageurl.createdAt).format('ddd -MMM h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

document.querySelector('#form-message').addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, () => {
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log("message delivered!")
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert("geolocation is not supported by the browser")
    }
    //disable
    $sendlocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            //enable
            $sendlocationButton.removeAttribute('disabled', 'disabled')
            console.log("location shared")
        })
    })
  
})  

socket.emit('join', ({username, room}), (error) => {
    if(error) {
        alert(error)
        location.href ='/'
    }
})