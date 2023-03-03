import { SketchRes } from "./Sketch";

export abstract class Drawable {
  protected sketchRes?: SketchRes;

  protected get fps() { return this.sketchRes?.fps }
  protected get canvas() { return this.sketchRes?.canvas }
  protected get sketchOptions() { return this.sketchRes?.options }
  protected get ctx() { return this.canvas?.getContext('2d') }

  protected abstract onDraw: () => void
  
  public draw(res: SketchRes) {
    this.updateOptions(res)
    this.onDraw()
  }

  protected getDistanceFromSpeed = (speed: number) => {
    return speed * this.getFrameTime() * (this.sketchOptions?.pixelMeterSize ?? 1)
  }

  protected getFrameTime = () => {
    return 1 / (this.fps ?? 1)
  }

  private updateOptions = (res: SketchRes) => {
    this.sketchRes = res
  }
}