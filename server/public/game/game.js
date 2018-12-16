const canvas = document.getElementById('application');
const app = new pc.Application(canvas, {});

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

app.start();
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

const light = new pc.Entity();
light.addComponent('light');
light.setEulerAngles(90, 90, 45);
app.root.addChild(light);

app.scene.ambientLight = new pc.Color(0.7, 0.7, 0.6);


class Player {
    constructor(x, y, z, alpha, beta, gamma, camera) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;
        this.cube = new pc.Entity();
        this.camera = new pc.Entity();
        app.root.addChild(this.cube);
        app.root.addChild(this.camera);
        this.camera.setPosition(x, y, z);
        this.cube.setPosition(x, y, z);
        this.cube.setEulerAngles(alpha, beta, gamma);
        this.camera.setEulerAngles(alpha, beta, gamma);
        this.cube.addComponent('model', {
            type: 'box'
        });
        if (camera)
            this.camera.addComponent('camera', {
                clearColor: new pc.Color(0.1, 0.1, 0.1)
            });
    }

}

let player = new Player(0, 0, 0, 45, 45, 0, false);
let player2 = new Player(10, 0, 0, 0, 0, 0, false);
let player3 = new Player(0, 10, 0, 0, 0, 0, true);
let player4 = new Player(0, 0, 10, 0, 0, 0, true);