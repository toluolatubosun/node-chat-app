// connect to socket io
const socket = io('/');

// Query Dom
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    online = document.getElementById('online'),
    onlineCount = document.getElementById('online-count');

// Emit events
socket.emit('join-chat', { chatId, userId });

btn.addEventListener('click', (e) => {
    socket.emit('send-message', {
        message: message.value,
        handle: handle.value,
        id: userId
    });
    output.innerHTML += `<p><strong>${handle.value} - ${userId}:</strong> ${message.value} </p>`;
    message.value = "";
});

message.addEventListener('keypress', (e) => {
    socket.emit('typing', { handle: handle.value, id: userId });
});

// Listen for event
socket.on('count', data => {
    onlineCount.innerHTML = data
});

socket.on('recieve-message', (data) => {
    feedback.innerHTML = "";
    output.innerHTML += `<p><strong>${data.handle} - ${data.id}:</strong> ${data.message} </p>`;
    try{
        document.getElementById(data.id).remove();
    }catch(err){
        console.log('error');
    }
    online.innerHTML += `<p id="${data.id}" class="online-user">${data.handle} - ${data.id}</p>`;
});

socket.on('new-user', (data) => {
    onlineCount.innerHTML = data.number
    output.innerHTML += `<p><strong> ${data.userID} just joined this chat</strong></p>`;
    online.innerHTML += `<p id="${data.userID}" class="online-user">${data.userID}</p>`;
});

socket.on('user-disconnected', (data) => {
    onlineCount.innerHTML = data.number;
    output.innerHTML += `<p><strong> ${data.userID} just left the chat </strong></p>`;
    try{
        document.getElementById(data.userID).remove();
    }catch(err){
        console.log('error');
    }
});

socket.on('typing', (data) => {
    feedback.innerHTML = `<p><em>${data.handle} - ${data.id} is typing a message...</em></p>`;
    try{
        document.getElementById(data.id).remove();
    }catch(err){
        console.log('error');
    }
    online.innerHTML += `<p id="${data.id}" class="online-user">${data.handle} - ${data.id}</p>`;
});