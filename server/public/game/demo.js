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
app.scene.ambientLight = new pc.Color(0.7, 0.7, 0.6);
cube.rotate(45, 45, 45);

let boxMaterial = new pc.PhongMaterial();
boxMaterial.diffuse.set(0, 0.58, 0.86);
boxMaterial.update();
cube.model.model.meshInstances[0].material = boxMaterial;

let t = 0;
let angle = 0;

cube.setPosition(1.5 * Math.sin(t), 1.5 * Math.sin(t - 1), 0);

// register a global update event
app.on('update', function(deltaTime) {
    // camera.setPosition(0, 0, x = deltaTime * v + x);
    light.setEulerAngles(90, 90, ++angle);
    cube.rotate(deltaTime * 10 * (Math.random() + 1), deltaTime * 20 * (Math.random() + 1), deltaTime * 30 * (Math.random() + 1));
    // cube.setPosition(x = deltaTime * v + x, 0, 0);
    t += deltaTime;
    cube.setPosition(1.5 * Math.cos(t), 0.6 * Math.sin(2.2 * t - 1), Math.tan(1.5 * t));
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
