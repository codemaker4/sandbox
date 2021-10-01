let sandbox;
let ui;

function setup() {
    createCanvas(100, 100).parent("canvasContainer");
    noSmooth();
    pixelDensity(1);
    frameRate(60);
    canvas.style = "";

    sandbox = new Sandbox(width, height);
    sandbox.addElement(new Element("vacuum", [0,0,0],[],{"state":3,"density":0}))
    sandbox.addElement(new Element("air", [255,255,255],[sandbox.behaviours.gravity, sandbox.behaviours.flowGas],{"state":3,"density":1.225}))
    sandbox.addElement(new Element("sand", [255,255,0], [sandbox.behaviours.gravity, sandbox.behaviours.flowPowder], {"state":1,"density":1631}));
    sandbox.addElement(new Element("water", [0,0,255], [sandbox.behaviours.gravity, sandbox.behaviours.flowLiquid], {"state":2,"density":1000}));
    sandbox.addElement(new Element("fire", [255,100,0], [sandbox.behaviours.gravity, sandbox.behaviours.flowGas], {"state":3,"density":0.1}));
    sandbox.addElement(new Element("steam", [200,200,255], [sandbox.behaviours.gravity, sandbox.behaviours.flowGas], {"state":3,"density":1}));
    sandbox.addElement(new Element("glass", [200,220,200], [], {"state":0,"density":2000}));
    sandbox.addElement(new Element("magma", [200,0,0], [sandbox.behaviours.gravity, sandbox.behaviours.flowLiquid], {"state":2,"density":2000}));
    sandbox.addElement(new Element("stone", [150,150,150], [], {"state":0,"density":2000}));
    sandbox.addElement(new Element("rocks", [180,180,180], [sandbox.behaviours.gravity, sandbox.behaviours.flowPowder], {"state":1,"density":1800}));
    sandbox.addElement(new Element("gas", [150,50,0], [sandbox.behaviours.gravity, sandbox.behaviours.flowGas], {"state":3,"density":0.8}));

    sandbox.addReaction(new Reaction("vacuum", "air", "air", "air", 1));
    sandbox.addReaction(new Reaction("vacuum", "steam", "steam", "steam", 1));
    sandbox.addReaction(new Reaction("water", "fire", "steam", "air", 0.2));
    sandbox.addReaction(new Reaction("sand", "fire", "glass", "fire", 0.01));
    sandbox.addReaction(new Reaction("magma", "sand", "magma", "glass", 1));
    sandbox.addReaction(new Reaction("magma", "sand", "stone", "glass", 0.1));
    sandbox.addReaction(new Reaction("magma", "water", "magma", "steam", 1));
    sandbox.addReaction(new Reaction("magma", "water", "rocks", "steam", 0.02));
    sandbox.addReaction(new Reaction("magma", "stone", "stone", "magma", 0.05));
    sandbox.addReaction(new Reaction("magma", "glass", "glass", "magma", 0.05));
    sandbox.addReaction(new Reaction("stone", "water", "rocks", "water", 0.1));
    sandbox.addReaction(new Reaction("stone", "rocks", "stone", "stone", 0.03));
    sandbox.addReaction(new Reaction("magma", "rocks", "rocks", "magma", 0.03));
    // sandbox.addReaction(new Reaction("rocks", "rocks", "stone", "stone", 0.0001));
    sandbox.addReaction(new Reaction("fire", "gas", "fire", "fire", 1));
    sandbox.addReaction(new Reaction("magma", "air", "magma", "fire", 0.3));
    sandbox.addReaction(new Reaction("magma", "air", "rocks", "fire", 0.002));

    sandbox.addDecay(new Decay("steam", "water", 0.002)); // steam -> water
    sandbox.addDecay(new Decay("fire", "air", 0.03)); // fire -> air

    sandbox.simSpeed = 0.25;

    ui = new Ui(sandbox, document.getElementById("uiContainer"), canvas);

    for (let x = 0; x < sandbox.width; x++) {
        for (let y = 0; y < sandbox.height; y++) {
            sandbox.setPixel(x, y, floor(random(sandbox.elements.length)));
        }
    }
}

function draw() {
    ui.updateSanbox();

    sandbox.tick();

    if (mouseIsPressed && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        ui.draw(mouseX,mouseY);
    }

    sandbox.draw();
}