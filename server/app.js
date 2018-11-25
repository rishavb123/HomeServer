const express = require('express');
const port = 3000;
const app = express();
const upload = require('express-fileupload');
const fs = require('fs')

app.use(upload())

app.listen(port, () => {
    console.log("Server is running on " + port + " port");
});

app.get('/', (req, res) => {
    res.sendFile("public/index.html", { root: __dirname });
    res.end();
});

app.get('/files', (req, res) => {
    let arr = fs.readdirSync('upload').map(el => {
        return "<a href='/open-file/" + el + "'>" + el + "</a>"
    });
    res.send(arr.join('<br/>'));
    res.end();
});

app.get("/open-file*", (req, res) => {
    console.log("loaded");
    let filename = req.url.split('/')[req.url.split('/').length - 1];
    let filePath = __dirname + "\\upload\\" + filename;
    let stat = fs.statSync(filePath);
    // 'Content-Type': 'audio/mpeg',
    // res.writeHead(200, {
    //     'Content-Length': stat.size,
    //     'Content-Disposition': 'attachment; filename=' + filename
    // });
    // let file = fs.readFile(filePath, 'binary');

    // var readStream = fs.createReadStream(filePath);
    // readStream.on('open', err => {
    //     readStream.pipe(res);
    // });
    res.send(filePath);
    res.end();
});

app.post("/", (req, res) => {
    if (req.files) {
        let file = req.files.filename,
            filename = req.files.filename.name;

        file.mv("./upload/" + filename, err => {
            if (err) {
                res.send("Error Occured: \n" + err);
            } else {
                res.send("Done");
            }
            res.end();
        });
    }
});