class Ui {
    constructor(sandbox, container, canvas) {
        this.sandbox = sandbox;
        this.container = container;
        this.canvas = canvas;

        createP('select element').parent(this.container);
        this.elementSelector = createSelect().parent(this.container);
        for (let i = 0; i < this.sandbox.elements.length; i++) {
            const element = this.sandbox.elements[i];
            this.elementSelector.option(element.name);
        }

        createP('draw size').parent(this.container);
        this.drawSizeSlider = createSlider(1,ceil(sandbox.width/5),1,1).parent(this.container);

        this.fillButton = createButton("fill sandbox");
        this.fillButton.parent(this.container);
        this.fillButton.mousePressed(() => {
            if (this.elementSelector.value() == '') {
                return;
            }
            this.sandbox.fillRect(0,0,this.sandbox.width,this.sandbox.height,this.elementSelector.value())
        });

        this.randomButton = createButton("randomise sandbox");
        this.randomButton.parent(this.container);
        this.randomButton.mousePressed(() => {  
            for (let x = 0; x < this.sandbox.width; x++) {
                for (let y = 0; y < this.sandbox.height; y++) {
                    this.sandbox.setPixel(x, y, floor(random(this.sandbox.elements.length)));
                }
            }
        });

        createP('time speed').parent(this.container);
        this.speedSelector = createSelect().parent(this.container);
        this.speedSelector.option("0");
        this.speedSelector.option("0.1");
        this.speedSelector.option("0.25");
        this.speedSelector.option("1");
        this.speedSelector.option("3");
        this.speedSelector.option("10");
    }
    draw(x, y) {
        if (this.elementSelector.value() == '') {
            return;
        }
        let drawRad = this.drawSizeSlider.value()/2;
        this.sandbox.fillRect(
            floor(x-drawRad), floor(y-drawRad),
            floor(x+drawRad), floor(y+drawRad),
            this.elementSelector.value()
        )
    }
    updateSanbox() {
        sandbox.simSpeed = parseFloat(this.speedSelector.value());
    }
}