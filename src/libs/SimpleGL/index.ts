export class SimpleGL{
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        let gl = canvas.getContext('webgl');
        if (!gl){
           throw new Error('获取WebGLRenderingContext失败');
        }
        this.gl = gl;
    }
}
