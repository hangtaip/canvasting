interface Rain {
   initScene(): void;
   drawScene(): void;
   resizeCanvas(): void;
   calcDistance(node1: { x: number, y: number }, node2: Droplets): number | undefined;
   shuffleArray(arr: any[]): any[];
}

interface Raindrop {
   drawNode(): void;
   moveNode(): void;
   storeScene(canvas: HTMLCanvasElement): void;
}

export class RainScene implements Rain {
   readonly canvas: HTMLCanvasElement;
   density: number;
   anchor_length: number;
   newCanvasSize: { width: number, height: number };
   stabilizeCanvas: { width: number, height: number };
   nodes: Droplets[];
   firstNodes: Droplets[];
   otherNodes: Droplets[];

   constructor(canvas: HTMLCanvasElement, density: number = 20, anchor_length: number = 20) {
      this.canvas = canvas;
      this.density = density;
      this.anchor_length = anchor_length;
      this.newCanvasSize = { width: canvas.width, height: canvas.height };
      this.stabilizeCanvas = { width: canvas.width, height: canvas.height };
      this.nodes = [];
      this.firstNodes = [];
      this.otherNodes = [];
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
               x: this.nodes[i]!.x,
               y: this.canvas.height,
            }, this.nodes[i]);

            this.nodes[i]!.brightness = 1 - distance! / this.canvas?.height;
            this.nodes[i]!.color = `rgba(0, 0, 255, ${this.nodes[i]!.brightness}`;

            this.firstNodes[i]?.drawNode();
            this.firstNodes[i]?.moveNode();
            if (!this.nodes[i]!.firstTime) {
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

   waitChange(canvas: HTMLCanvasElement, callback: (currWidth: number) => void) {
      let prevWidth = canvas.width;
      let stableFrames = 0;

      function checkWidth() {
         requestAnimationFrame(function(this: RainScene) {
            const currWidth = canvas.width;

            if (currWidth !== prevWidth) {
               stableFrames = 0;
               prevWidth = currWidth;
            } else stableFrames++;

            if (stableFrames >= 60) {
               callback(currWidth);
            } else {
               checkWidth();
            }
         });
      };

      checkWidth();
   }


   resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      if (this.nodes.length > 0) {
         this.waitChange(this.canvas, () => {
            this.updateScene();
         });
         // this.drawScene();
      }
   }

   calcDistance(node1: { x: number, y: number }, node2: Droplets | undefined): number | undefined {
      if (node1 && node2) {

         return Math.sqrt(Math.pow(node1.x - node2.x, 2) + (Math.pow(node1.y - node2.y, 2)));
      }
      return undefined;
   }

   shuffleArray(arr: any[]) {
      for (let i = arr.length - 1; i > 0; i--) {
         let j = Math.floor(Math.random() * (i + 1));
         [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      return arr;
   }
}

class Droplets implements Raindrop {
   canvas: HTMLCanvasElement | null;
   anchorX: number;
   anchorY: number;
   x: number;
   y: number;
   energy: number;
   brightness: number;
   color: string;
   vy: number;
   firstTime: boolean;

   constructor(x: number, y: number, anchor_length: number) {
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

   storeScene(canvas: HTMLCanvasElement) {
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
