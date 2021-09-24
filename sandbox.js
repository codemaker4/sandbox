class Sandbox {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint8Array(this.width * this.height); // the world
        this.behaviours = {} // dictionary of sample functions for elements to use, done once per pixel per frame on average
        this.elements = []; // array of element objects , values in pixels array determine the index in this array
        this.reactions = []; // array of arrays of reaction objects. doing reactions[elementID] gives all reactions that have that reaction as the first requirement.
        this.decays = []; // similar to reactions, but for decays.
        this.simSpeed = 1;

        this.behaviours = {
            "gravity": function(sandbox, x, y, pixel) {
                let otherPixel = sandbox.getPixel(x, y+1);
                if (y >= sandbox.height-1 || pixel == otherPixel || sandbox.elements[otherPixel].properties.state == 0) {
                    return;
                }
                if (sandbox.elements[otherPixel].properties.density < sandbox.elements[pixel].properties.density) {
                    if (random() > sandbox.elements[otherPixel].properties.density / sandbox.elements[pixel].properties.density) {
                        sandbox.setPixel(x, y, otherPixel);
                        sandbox.setPixel(x, y+1, pixel);
                    }
                }
            },
            "flowPowder": function(sandbox, x, y, pixel) {
                let direction = -1 + (random()<0.5)*2
                let otherPixel;
                if (y < sandbox.height-1 && sandbox.elements[(otherPixel = sandbox.getPixel(x+direction, y+1))].properties.state == 3) {
                    sandbox.setPixel(x, y, otherPixel);
                    sandbox.setPixel(x+direction, y+1, pixel);
                } else if (y < sandbox.height-1 && sandbox.elements[(otherPixel = sandbox.getPixel(x-direction, y+1))].properties.state == 3) {
                    sandbox.setPixel(x, y, otherPixel);
                    sandbox.setPixel(x-direction, y+1, pixel);
                } else if (random() < 0.1 && sandbox.elements[(otherPixel = sandbox.getPixel(x+direction, y))].properties.state == 2) {
                    sandbox.setPixel(x, y, otherPixel);
                    sandbox.setPixel(x+direction, y, pixel);
                }
            },
            "flowLiquid": function(sandbox, x, y, pixel) {
                let otherPixel
                if (y < sandbox.height-1 && sandbox.elements[(otherPixel = sandbox.getPixel(x, y+2))].properties.state == 3) {
                    sandbox.setPixel(x, y, otherPixel);
                    sandbox.setPixel(x, y+2, pixel);
                } else {
                    let direction = -1 + (random()<0.5)*2
                    if (sandbox.elements[(otherPixel = sandbox.getPixel(x+(direction*2), y))].properties.state == 3) {
                        sandbox.setPixel(x, y, otherPixel);
                        sandbox.setPixel(x+(direction*2), y, pixel);
                    } else if (sandbox.elements[(otherPixel = sandbox.getPixel(x-(direction*2), y))].properties.state == 3) {
                        sandbox.setPixel(x, y, otherPixel);
                        sandbox.setPixel(x-(direction*2), y, pixel);
                    } else if (sandbox.elements[(otherPixel = sandbox.getPixel(x+direction, y))].properties.state == 3) {
                        sandbox.setPixel(x, y, otherPixel);
                        sandbox.setPixel(x+direction, y, pixel);
                    } else if (sandbox.elements[(otherPixel = sandbox.getPixel(x-direction, y))].properties.state == 3) {
                        sandbox.setPixel(x, y, otherPixel);
                        sandbox.setPixel(x-direction, y, pixel);
                    }
                }
            },
            "flowGas": function(sandbox, x, y, pixel) {
                let otherPixel;
                if (x < sandbox.width-1 && (otherPixel = sandbox.getPixel(x+1, y)) != pixel && sandbox.elements[otherPixel].properties.state == 3) {
                    sandbox.setPixel(x+1, y, pixel);
                    sandbox.setPixel(x, y, otherPixel);
                }
            },
        }
    }
    addBehaviour(name, func) {
        this.behaviours[name] = func;
    }
    addElement(element) {
        this.elements.push(element);
    }
    addReaction(reaction) {
        reaction.inA = this.getELementByName(reaction.inA);
        reaction.inB = this.getELementByName(reaction.inB);
        reaction.outA = this.getELementByName(reaction.outA);
        reaction.outB = this.getELementByName(reaction.outB);
        if (this.reactions[reaction.inA] === undefined) {
            this.reactions[reaction.inA] = [];
        }
        this.reactions[reaction.inA].push(reaction);
    }
    addDecay(decay) {
        decay.inA = this.getELementByName(decay.inA);
        decay.outA = this.getELementByName(decay.outA);
        if (this.decays[decay.inA] === undefined) {
            this.decays[decay.inA] = [];
        }
        this.decays[decay.inA].push(decay);
    }
    tick() {
        let index;
        let xy;
        let pixel;
        let behaviour;
        const loopCount = this.pixels.length*this.simSpeed
        for (let i = 0; i < loopCount; i++) {
            index = floor(random(this.pixels.length));
            xy = this.getXY(index);
            pixel = this.pixels[index];
            if (this.elements[pixel].behaviours.length > 0) {
                behaviour = floor(random(this.elements[pixel].behaviours.length))
                this.elements[pixel].behaviours[behaviour](this, xy.x, xy.y, pixel);
            }
        }

        let reactionCount;
        for (let i = 0; i < loopCount; i++) {
            index = floor(random(this.pixels.length));
            xy = this.getXY(index);
            pixel = this.pixels[index];
            if (this.reactions[pixel] === undefined) {
                continue;
            }
            reactionCount = this.reactions[pixel].length;
            for (let j = 0; j < reactionCount; j++) {
                if (this.reactions[pixel][floor(random()*reactionCount)].do(this, xy.x, xy.y)) {
                    break;
                }
            }
        }

        let decayCount;
        for (let i = 0; i < loopCount; i+=10) {
            index = floor(random(this.pixels.length));
            xy = this.getXY(index);
            pixel = this.pixels[index];
            if (this.decays[pixel] === undefined) {
                continue;
            }
            decayCount = this.decays[pixel].length;
            for (let j = 0; j < decayCount; j++) {
                if (this.decays[pixel][floor(random()*decayCount)].do(this, xy.x, xy.y)) {
                    break;
                }
            }
        }
    }
    draw() {
        loadPixels();
        for (let i = 0; i < this.pixels.length; i++) {
            const pixel = this.pixels[i];
            pixels[i*4 +0] = this.elements[pixel].color[0];
            pixels[i*4 +1] = this.elements[pixel].color[1];
            pixels[i*4 +2] = this.elements[pixel].color[2];
            pixels[i*4 +3] = 255;
        }
        updatePixels();
    }
    getIndex(x, y) {
        return constrain(x, 0, this.width-1) + (constrain(y, 0, this.height-1)*this.width);
    }
    getPixel(x, y) {
        return this.pixels[this.getIndex(x,y)];
    }
    setPixel(x, y, value) {
        const index = this.getIndex(x, y);
        this.pixels[index] = value;
    }
    getXY(i) {
        return {
            x: i%this.width,
            y: floor(i/this.width)
        }
    }
    getElement(x, y) {
        return this.elements[this.getPixel(x, y)];
    }
    fillRect(x1, y1, x2, y2, element) {
        element = this.getELementByName(element);
        for (let x = x1; x < x2; x++) {
            for (let y = y1; y < y2; y++) {
                sandbox.setPixel(x, y, element);
            }
        }
    }
    replaceRect(x1, y1, x2, y2, element, replace) {
        element = this.getELementByName(element);
        replace = this.getELementByName(replace);
        for (let x = x1; x < x2; x++) {
            for (let y = y1; y < y2; y++) {
                if (sandbox.getPixel(x, y) == replace) {
                    sandbox.setPixel(x, y, element);
                }
            }
        }
    }
    getELementByName(name) {
        if (typeof name == "number") {
            return name;
        }
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            if (element.name == name) {
                return i;
            }
        }
        throw "Error: no element with name found. " + name;
        return 0;
    }
}

// function exampleBehaviour(sandbox, x, y, pixel) {
//    sandbox.setPixel();
// }

class Element {
    constructor(name, color, behaviours, properties) {
        this.name = name;
        this.color = color;
        this.behaviours = behaviours; // list of behaviours
        this.properties = properties; // {state: <0=solid, 1=powder, 2=liquid, 3=gas>, density: <kg/m3>}
    }
}

class Reaction {
    constructor(inA, inB, outA, outB, chance) {
        this.inA = inA; // id of elements
        this.inB = inB;
        this.outA = outA;
        this.outB = outB;
        this.chance = chance; // chance per pixel per frame that this reaction happens
    }
    do(sandbox, x, y) { // pos of pixel of type inA
        if (random() > this.chance) {
            return
        }
        let dx = 0;
        let dy = 0;
        if (random() <0.5) {
            dx = round(random())*2-1;
            if ((x == 0 && dx == -1) || (x == sandbox.width-1 && dx == 1)) {
                return false;
            }
        } else {
            dy = round(random())*2-1;
            if ((y == 0 && dy == -1) || (y == sandbox.height-1 && dy == 1)) {
                return false;
            }
        }
        if (sandbox.getPixel(x+dx, y+dy) == this.inB) {
            sandbox.setPixel(x, y, this.outA);
            sandbox.setPixel(x+dx, y+dy, this.outB);
            return true;
        }
        return false;
    }
}

class Decay { // self reaction for decaying, like steam becoming water or fire becoming smoke
    constructor(inA, outA, chance) {
        this.inA = inA; // id of elements
        this.outA = outA;
        this.chance = chance; // chance per pixel per frame that this reaction happens
    }
    do(sandbox, x, y) {
        if (random() < this.chance) {
            sandbox.setPixel(x, y, this.outA);
            return true;
        }
        return false;
    }
}