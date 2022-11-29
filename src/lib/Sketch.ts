import { Callback } from "../abstractions/Callback";

export interface SketchOptions {
  readonly fpsLimit: number;
  readonly pixelMeterSize: number;
}

export interface SketchRes {
  readonly canvas: HTMLCanvasElement;
  readonly fps: number;
  readonly options: SketchOptions;
}

type SketchCallback = Callback<SketchRes>

export class Sketch {
  private readonly canvas: HTMLCanvasElement;
  private readonly options: SketchOptions;

  private callback?: SketchCallback;
  private request?: number;
  private time: number;

  constructor(canvas: HTMLCanvasElement, options?: Partial<SketchOptions>) {
    this.time = Date.now()

    this.canvas = canvas
    this.options = {
      fpsLimit: options?.fpsLimit ?? 60,
      pixelMeterSize: options?.pixelMeterSize ?? 80
    }
  }

  private getCurrentFps = () => {
    const newTime = Date.now()
    const oldTime = this.time

    const frameDuration = newTime - oldTime;
    return 1000 / frameDuration;
  }

  private animate = () => {
    this.request = requestAnimationFrame(this.animate)
    const realFps = this.getCurrentFps()

    if(realFps > this.options.fpsLimit)
      return

    this.time = Date.now()
    this.clear();
    this.callback?.({
      canvas: this.canvas,
      fps: realFps,
      options: this.options
    });
  }

  private clear = () => {
    this.canvas
      .getContext('2d')
      ?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public draw = (callback: SketchCallback) => {
    this.callback = callback;
    this.animate()
  }

  public destroy = () => {
    if(!this.request)
      return

    cancelAnimationFrame(this.request)
  }
}