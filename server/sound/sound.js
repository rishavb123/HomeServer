// const audio = require('audio-stream');
// const createBuffer = require('audio-buffer-from');

var socket = io.connect('http://localhost:8000/sound');

socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
});
socket.on('message', function(data) {
    alert(data);
});
let recordRTC;
navigator.getUserMedia({
    audio: true,
    video: false
}, stream => {
    // let audioCtx = new AudioContext();
    // let source = audioCtx.createMediaStreamSource(stream);
    console.log(stream);
}, err => {
    console.log(err);
});