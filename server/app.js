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
    // play = require('audio-play'),
    // load = require('audio-loader'),
    childProcess = require('child_process'),
    spawn = childProcess.spawn,
    randomstring = require('randomstring'),
    nodemailer = require('nodemailer'),
    detector = fr.FaceDetector(),
    recognizer = fr.FaceRecognizer(),
    SSHClient = require('ssh2').Client,
    { login } = require("tplink-cloud-api"),
    nest = require("unofficial-nest-api"),
    cors = require('cors');


require('dotenv').config()
const createBuffer = require('audio-buffer-from');

let tplink_device;
getTplinkDevice();

nestLogin();

app.use(cors());
app.use(upload());
app.use(express.static("public"));
app.use('/modules', express.static(__dirname + '/node_modules'));

async function getTplinkDevice() {
    try {
        let tplink = await login(process.env.tplink_email, process.env.tplink_password, "12345");
        await tplink.getDeviceList();
        tplink_device = tplink.getHS200("RBSmartDimmer");
    } catch (e) {
        console.log("HERE: " + e.message);
    }
}

function nestLogin() {
    nest.login(process.env.nest_email, process.env.nest_password, (err, data) => {
        if (err)
            console.log(err.message);
        else
            nest.fetchStatus((data) => {});
    });
}
/**
 * Functions
 */
async function download(url, dest) {
    let file = fs.createWriteStream(dest);
    let request = http.get(url, (response) => {
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

io.of('/ssh').on('connection', function(socket) {
    let conn = new SSHClient();
    conn.on('ready', function() {
        socket.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
        conn.shell(function(err, stream) {
            if (err)
                return socket.emit('data', '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
            socket.on('data', function(data) {
                stream.write(data);
            });
            stream.on('data', function(d) {
                socket.emit('data', d.toString('binary'));
            }).on('close', function() {
                conn.end();
            });
        });
    }).on('close', function() {
        socket.emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
        socket.emit('end', 'end');
    }).on('error', function(err) {
        socket.emit('data', '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
    }).connect({
        host: process.env.ip,
        username: "rishav",
        password: process.env.password
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

app.get("/lights", (req, res) => {
    if (req.query.admin_key == process.env.admin_key) {
        if (req.query.state == undefined || req.query.state == null)
            req.query.state = "toggle";
        switch (req.query.state.toLowerCase()) {
            case "on":
                tplink_device.powerOn();
                res.send("Device On");
                break;
            case "off":
                tplink_device.powerOff();
                res.send("Device Off");
                break;
            case "toggle":
                tplink_device.toggle();
                res.send("Device Toggled");
                break;
            default:
                res.send("Invalid State");
                break;
        }
    } else {
        res.send("Incorrect Admin Key");
    }
});

app.get("/thermostat", (req, res) => {
    try {
        if (req.query.admin_key == process.env.admin_key) {
            nest.setTemperature(nest.getDeviceIds()[0], parseInt(req.query.temp));
            res.send("Set Temperature to " + req.query.temp);
        } else {
            res.send("Incorrect Admin Key");
        }
    } catch (e) {
        res.send("Error setting thermostat temperature: " + e.message);
        console.log("Error setting thermostat temperature: " + e.message);
    }
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
