const socket = io();
//here we are not passing any host, because io method searches for host where it hosted.

const $submitButton = document.getElementById('submit-btn');
const $messageInput = document.getElementById('message-input');
const $sendLocation = document.getElementById('share-location');
const $messageSection =  document.getElementById('messages');

//templates
const msgTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const userListTemplate = document.getElementById('users-list').innerHTML;

//scroll down function
const scrollDown = () => {
    //last messageElement
    const $newMessage = $messageSection.lastElementChild;

    //height of the new message
    const $newStyleMargin = parseInt(getComputedStyle($newMessage).marginBottom) || 0;
    const $newMessageHeight = $newMessage.offsetHeight + $newStyleMargin;

    //visible height
    const visibleHeight = $messageSection.offsetHeight;

    //height of messages container
    const containerHeight = $messageSection.scrollHeight;

    //how far i have scrolled?
    const scrollOffset = $messageSection.scrollTop + visibleHeight;
    if(containerHeight - $newMessageHeight <= scrollOffset){
        $messageSection.scrollTop = $messageSection.scrollHeight;
    }
}

//on message
socket.on("message", (message) => {
    const html = Mustache.render(msgTemplate,{
        username:message.username,
        message:message.text,
        deliveredAt:moment(message.deliveredAt).format('h:mm a')
    });
    $messageSection.insertAdjacentHTML('beforeend',html);
    console.log(message);
    scrollDown();
});

//on location share
socket.on('locationShared', (location)=>{
    const html = Mustache.render(locationTemplate,{
        username:location.username,
        url:location.url,
        deliveredAt:moment(location.deliveredAt).format('h:mm a')
    });
    $messageSection.insertAdjacentHTML('beforeend',html);
    scrollDown();
});

//on usersRender
socket.on('renderUserList', ({roomname, users})=>{
   const html = Mustache.render(userListTemplate, {
    roomname,
    users
   });

   document.getElementById('active-users-list').innerHTML = html;
});

//on message form submit
const formSubmit = (event, form) => {
    event.preventDefault();

    $submitButton.setAttribute('disabled', 'disabled');
    const message = $messageInput.value;
    //implementing acknowledgement mechanism.
    socket.emit('sendMessage', message, (err) => {
        $submitButton.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();     
        if(err){
           return console.log(err.message);
        }
        console.log('Delivered');
    });
}

//share location form
const shareLocation = () => {
    if(!navigator.geolocation){
        return alert("geolocation is not supported by your browser!");
    }
    $sendLocation.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        if(position){
            socket.emit('sendLocation',{
                "latitude":position.coords.latitude,
                "longitude":position.coords.longitude
            },(response)=>{
                console.log(response);
                $sendLocation.removeAttribute('disabled');
            })
        }
    });
}

//join rooom submit
const joinRoom = (event, form) =>{
    event.preventDefault();

    const username = form.username.value.trim().toLowerCase();
    const roomname = form.chatroom.value.trim().toLowerCase();

    socket.emit('join', { username, roomname }, (error) =>{
        if(error){
            alert(error['error']);
            return false;
        }

        document.querySelector('.chat').classList.remove('hide');
        document.querySelector('.centered-form').classList.add('hide');

    });
    return true;
}


/*
    Event Acknowledgement
    =====================

    event acknowledgement is a success message returned to an emitter from reciever, by calling a callback function passed as a parameter.
    
    example:
    ======

    client.emit('cust-event', 'my message', () => {
        console.log('This is acknowledgement msg');
    });

    server.on('cust-event', (msg, cb) => {
        process(msg);
        cb(); ==> calling callback() function after processing message.
        
    });


    this is how acknowledgement works.
*/