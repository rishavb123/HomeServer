const express = require('express'),
    port = 8000,
    app = express(),
    fs = require('fs'),
    server = require('http').createServer(app),
    upload = require('express-fileupload'),
    send = require('send'),
    fr = require('face-recognition'),
    io = require('socket.io')(server),
    ss = require('socket.io-stream'),
    play = require('audio-play'),
    childProcess = require('child_process'),
    spawn = childProcess.spawn,
    randomstring = require('randomstring'),
    nodemailer = require('nodemailer'),
    detector = fr.FaceDetector(),
    recognizer = fr.FaceRecognizer();

const createBuffer = require('audio-buffer-from');

app.use(upload());
app.use(express.static("public"));

/**
 * Functions
 */
async function download(url, dest) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            return dest;
        });
    }).on('error', (err) => { // Handle errors
        fs.unlink(dest);
        return "";
    });
};

/**
 * Set up Server
 */
server.listen(port, () => {
    console.log("Server is running on " + port + " port");
});

/**
 * Socket io 
 */
io.on('connection', function(socket) {
    console.log('Client connected...');

    socket.on('join', function(data) {
        console.log(data);
        socket.emit('messages', 'Hello from server');
    });

});

io.of('/sound').on('connection', socket => {
    console.log("Client connected to sound sub page");
    socket.on('audio', data => {
        console.log(data.data, "DONE");
        // let playback = play(createBuffer(data.data, 'interleaved 96000'), null, null);
    });
});

/**
 * Handle Get Requests
 */

app.get('/', (req, res) => {
    res.sendFile("public/index.html", { root: __dirname });
});

app.get('/files', (req, res) => {
    let arr = fs.readdirSync('upload').map(el => {
        return "<a href='/open-file/" + el + "'>" + el + "</a>"
    });
    res.send(arr.join('<br/>'));
});

app.get("/open-file*", (req, res) => {
    send(req, __dirname + "/upload/" + req.url.split('/')[req.url.split('/').length - 1]).pipe(res);
});

app.get("/email*", (req, res) => {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.email_pass
        }
    });

    let mailOptions = {
        from: process.env.email,
        to: 'rishavb123@bhagat.io',
        subject: 'SAT Scores are out GO CHECK',
        html: 'It was ' + req.url.split('/')[req.url.split('/').length - 1].replace(/%20/g, ' ') + '<a href="https://studentscores.collegeboard.org/viewscore"> CLICK AND CHECK </a>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            res.send(error);
        } else {
            res.send('Email sent: ' + info.response);
        }
    });

});

/**
 * Handle Post Requests
 */
app.post("/", (req, res) => {
    if (req.files) {
        let file = req.files.filename,
            filename = req.files.filename.name;

        file.mv("./upload/" + filename, err => {
            if (err) {
                res.send("Error Occured: <br/>" + err);
            } else {
                res.send("Done");
            }
            res.end();
        });
    }
});

app.post("/people", (req, res) => {
    console.log(req.body.name);
    if (req.files) {
        let file = req.files.filename,
            filename = req.files.filename.name;
        file.mv("./faces/" + req.body.name + "/" + randomstring.generate(15) + filename.split('.')[filename.split('.').length - 1], err => {
            if (err) {
                res.send("Error Occured: <br/>" + err);
            } else {
                res.send("Done");
            }
            res.end();
        });
    }
});