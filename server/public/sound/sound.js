const audio = require('audio-stream');

var socket = io.connect('http://192.168.1.50:8000:8000/sound');

socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
});
socket.on('message', function(data) {
    alert(data);
});

navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
}, mediaStream => {
    let stream = audio(mediaStream, {
        channels: 1,
        volume: 0.5
    });

    stream.on('data', data => {
        socket.emit('audio', data);
    });
}, err => {
    console.log(err);
});