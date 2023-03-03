import { Callback } from "../abstractions/Callback";
import { CollisionableObject } from "./CollisionableObject";

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

  private updateFps = () => {
    this.time = Date.now()
  }

  private animate = () => {
    this.request = requestAnimationFrame(this.animate)
    const realFps = this.getCurrentFps()

    if(realFps > this.options.fpsLimit)
      return

    this.updateFps()
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

  public isObjectOut(obj: CollisionableObject) {
    const nextCoords = obj.getNextCoords()

    return nextCoords.x + obj.boundingBox.width > this.canvas.width ||
      nextCoords.y + obj.boundingBox.height > this.canvas.height ||
      nextCoords.x < 0 ||
      nextCoords.y < 0
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