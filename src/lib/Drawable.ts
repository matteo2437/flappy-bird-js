import { SketchOptions, SketchRes } from "./Sketch";

export abstract class Drawable {
  protected fps?: number;
  protected sketchOptions?: SketchOptions;
  protected canvas?: HTMLCanvasElement;
  protected get ctx() { return this.canvas?.getContext('2d') }

  abstract onDraw: () => void
  
  public draw = (res: SketchRes) => {
    this.updateOptions(res)
    this.onDraw()
  }

  protected getDistance = (speed: number) => {
    return speed * this.getFrameTime()
  }

  protected getFrameTime = () => {
    return 1 / (this.fps ?? 1)
  }

  private updateOptions = (res: SketchRes) => {
    this.fps = res.fps
    this.canvas = res.canvas
    this.sketchOptions = res.options
  }
}