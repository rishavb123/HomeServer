const canvas = document.getElementById('application');
const app = new pc.Application(canvas, {});

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

app.start();
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

const cube = new pc.Entity('obj');
const camera = new pc.Entity('camera');
const light = new pc.Entity('light');

// ensure canvas is resized when window changes size
window.addEventListener('resize', function() {
    app.resizeCanvas();
});

cube.addComponent('model', {
    type: 'box'
});

camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.1, 0.1)
});

light.addComponent('light');

app.root.addChild(cube);
app.root.addChild(camera);
app.root.addChild(light);

// set up initial positions and orientations
camera.setPosition(0, 0, 4);
light.setEulerAngles(0, 0, 0);
cube.rotate(45, 45, 45);

let x = 40;
let v = 2;

let angle = 0;

// register a global update event
app.on('update', function(deltaTime) {
    // camera.setPosition(0, 0, x = deltaTime * v + x);
    light.setEulerAngles(90, 90, ++angle);
});

window.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case KEY_UP:
            camera.setPosition(0, 0, --x / 10);
            break;
        case KEY_DOWN:
            camera.setPosition(0, 0, ++x / 10);
            break;
    }
});