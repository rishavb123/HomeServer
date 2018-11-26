const express = require('express'),
    port = 80,
    app = express(),
    upload = require('express-fileupload'),
    fs = require('fs'),
    send = require('send'),
    fr = require('face-recognition'),
    detector = fr.FaceDetector(),
    recognizer = fr.FaceRecognizer();

app.use(upload())


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
app.listen(port, () => {
    console.log("Server is running on " + port + " port");
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
    send(req, __dirname + "\\upload\\" + req.url.split('/')[req.url.split('/').length - 1]).pipe(res);
});

app.get("/person", (req, res) => {
    res.sendFile("person/index.html", { root: __dirname });
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