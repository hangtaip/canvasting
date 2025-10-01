import eventManager from "./eventManager.js";
import DelegatedListener from "./listener.js";
export class RainScene {
    canvas;
    density;
    anchor_length;
    newCanvasSize;
    stabilizeCanvas;
    cancelWait;
    nodes;
    firstNodes;
    otherNodes;
    listener;
    unsubscribe;
    constructor(canvas, density = 20, anchor_length = 20) {
        this.canvas = canvas;
        this.density = density;
        this.anchor_length = anchor_length;
        this.newCanvasSize = { width: canvas.width, height: canvas.height };
        this.stabilizeCanvas = { width: canvas.width, height: canvas.height };
        this.nodes = [];
        this.firstNodes = [];
        this.otherNodes = [];
        // events
        this.listener = new DelegatedListener(this);
        this.listener.setDelegates(this);
        this.unsubscribe = eventManager.subscribe("alterDensity", this.listener);
    }
    initScene() {
        console.log("rain falling down");
        this.newCanvasSize = { width: this.canvas.width, height: this.canvas.height };
        for (let i = this.density; i < this.canvas.width; i += this.density) {
            for (let j = this.density; j < this.canvas.height / 10; j += this.density) {
                const nodes = new Droplets(i, j, this.anchor_length);
                nodes.storeScene(this.canvas);
                this.nodes.push(nodes);
            }
        }
        this.nodes = this.shuffleArray(this.nodes);
        this.firstNodes = this.nodes.slice(0, (this.nodes.length - 1) / 3);
        this.otherNodes = this.nodes.slice((this.nodes.length - 1) / 3);
    }
    drawScene() {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.nodes.length; i++) {
                const distance = this.calcDistance({
                    x: this.nodes[i].x,
                    y: this.canvas.height,
                }, this.nodes[i]);
                this.nodes[i].brightness = 1 - distance / this.canvas?.height;
                this.nodes[i].color = `rgba(0, 0, 255, ${this.nodes[i].brightness}`;
                this.firstNodes[i]?.drawNode();
                this.firstNodes[i]?.moveNode();
                if (!this.nodes[i].firstTime) {
                    this.otherNodes[i]?.drawNode();
                    this.otherNodes[i]?.moveNode();
                }
            }
        }
        requestAnimationFrame(this.drawScene.bind(this));
    }
    updateScene() {
        // problem: after resize, nodes x,y position stay the same
        // solution: update nodes x, y
        // store previous canvas size
        // calc diff of old and curr size
        // transition slowly?
        // update all nodes
        const scaleX = this.canvas.width / this.newCanvasSize.width;
        const scaleY = this.canvas.height / this.newCanvasSize.height;
        this.nodes.forEach((node) => {
            node.x *= scaleX;
            node.y *= scaleY;
        });
        this.newCanvasSize.width = this.canvas.width;
        this.newCanvasSize.height = this.canvas.height;
    }
    waitChange(getValue, callback, stableFramesTarget = 60) {
        // TODO: make this more general, not just for width
        // canvas: HTMLCanvasElement
        let prevValue = getValue();
        let stableFrames = 0;
        let rafId = null;
        let stopped = false;
        function loop() {
            if (stopped)
                return;
            const currValue = getValue();
            rafId = requestAnimationFrame(function () {
                if (stopped)
                    return;
                if (currValue !== prevValue) {
                    stableFrames = 0;
                    prevValue = currValue;
                }
                else {
                    stableFrames++;
                }
                if (stableFrames >= stableFramesTarget) {
                    stopped = true;
                    rafId = null;
                    callback(currValue);
                    return;
                }
                loop();
            });
        }
        ;
        loop();
        return () => {
            stopped = true;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.nodes.length > 0) {
            this.cancelWait?.();
            this.cancelWait = this.waitChange(() => this.canvas.width, (currWidth) => this.updateScene());
            // this.drawScene();
        }
    }
    calcDistance(node1, node2) {
        if (node1 && node2) {
            return Math.sqrt(Math.pow(node1.x - node2.x, 2) + (Math.pow(node1.y - node2.y, 2)));
        }
        return undefined;
    }
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    // TODO: target is hackish, use 'this' instead;
    handleAlterDensity(event, delegated) {
        const isDOM = delegated instanceof DelegatedListener;
        if (isDOM) {
            let elem = this.canvas;
            if (!elem)
                return;
            if (!document.contains(elem))
                return;
            this.cancelWait?.();
            this.cancelWait = this.waitChange(() => event.detail.value, () => {
                const input = event.detail.target;
                let newDensity = Number(input.max) - Number(input.value);
                newDensity = Math.max(newDensity, 20);
                if (newDensity < this.density) {
                    for (let i = newDensity; i < this.canvas.width; i += newDensity) {
                        for (let j = newDensity; j < this.canvas.height; j += newDensity) {
                            const nodes = new Droplets(i, j, this.anchor_length);
                            nodes.storeScene(this.canvas);
                            this.nodes.push(nodes);
                        }
                    }
                    console.log(this.nodes);
                }
                else if (newDensity > this.density) {
                    let diff = 0;
                    for (let i = newDensity; i < this.canvas.width; i += newDensity) {
                        for (let j = newDensity; j < this.canvas.height; j += newDensity) {
                            diff++;
                        }
                    }
                    const toRemove = this.nodes.length - diff;
                    for (let i = 0; i < toRemove; i++) {
                        const random = Math.floor(Math.random() * this.nodes.length);
                        if (this.nodes[random])
                            this.nodes.splice(random, 1);
                    }
                    console.log(this.nodes);
                    console.log("remove node");
                }
                this.nodes = this.shuffleArray(this.nodes);
                this.firstNodes = this.nodes.slice(0, (this.nodes.length - 1) / 3);
                this.otherNodes = this.nodes.slice((this.nodes.length - 1) / 3);
                this.density = newDensity;
                // target.drawScene();
                console.log("altering density");
            });
        }
        else {
            console.log("external");
        }
    }
}
class Droplets {
    canvas;
    anchorX;
    anchorY;
    x;
    y;
    energy;
    brightness;
    color;
    vy;
    firstTime;
    constructor(x, y, anchor_length) {
        this.canvas = null;
        this.anchorX = x;
        this.anchorY = y;
        this.x = Math.random() * (x - (x - anchor_length)) + (x - anchor_length);
        this.y = Math.random() * (y - (y - anchor_length)) + (y - anchor_length);
        this.energy = Math.random() * 100;
        this.brightness = 0;
        this.color = `rgba(255, 0, 0, ${this.brightness})`;
        this.vy = 2 + Math.random() * 3;
        this.firstTime = true;
    }
    storeScene(canvas) {
        this.canvas = canvas;
    }
    drawNode() {
        const ctx = this.canvas?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(this.x - 2, this.y);
            ctx.lineTo(this.x, this.y - 10);
            ctx.lineTo(this.x + 2, this.y);
            ctx.arc(this.x, this.y, 1, 0, Math.PI);
            ctx.fillStyle = this.color;
            ctx.closePath();
            ctx.fill();
        }
    }
    moveNode() {
        this.energy += 10;
        this.y += this.vy * this.energy / 100;
        if (this.canvas) {
            if (this.y >= this.canvas.height / 10 && this.firstTime) {
                this.firstTime = false;
            }
            if (this.y >= this.canvas.height) {
                this.energy = Math.random() * 100;
                this.y = 0;
            }
        }
    }
}
//# sourceMappingURL=rain.js.map