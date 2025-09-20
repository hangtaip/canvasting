interface Rain {
    initScene(): void;
    drawScene(): void;
    resizeCanvas(): void;
    calcDistance(node1: {
        x: number;
        y: number;
    }, node2: Droplets): number | undefined;
    shuffleArray(arr: any[]): any[];
}
interface Raindrop {
    drawNode(): void;
    moveNode(): void;
    storeScene(canvas: HTMLCanvasElement): void;
}
export declare class RainScene implements Rain {
    readonly canvas: HTMLCanvasElement;
    density: number;
    anchor_length: number;
    newCanvasSize: {
        width: number;
        height: number;
    };
    stabilizeCanvas: {
        width: number;
        height: number;
    };
    nodes: Droplets[];
    firstNodes: Droplets[];
    otherNodes: Droplets[];
    constructor(canvas: HTMLCanvasElement, density?: number, anchor_length?: number);
    initScene(): void;
    drawScene(): void;
    updateScene(): void;
    waitChange(canvas: HTMLCanvasElement, callback: (currWidth: number) => void): void;
    resizeCanvas(): void;
    calcDistance(node1: {
        x: number;
        y: number;
    }, node2: Droplets | undefined): number | undefined;
    shuffleArray(arr: any[]): any[];
}
declare class Droplets implements Raindrop {
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
    constructor(x: number, y: number, anchor_length: number);
    storeScene(canvas: HTMLCanvasElement): void;
    drawNode(): void;
    moveNode(): void;
}
export {};
//# sourceMappingURL=rain.d.ts.map