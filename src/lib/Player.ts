import { Drawable } from "./Drawable";

export class Player extends Drawable {
  private readonly gForce = 9.81;

  private ySpeed = 0;
  private yPos = 0;

  private keyDown = (e: KeyboardEvent) => {
    const action = {
      'Space': this.jump
    }[e.code]

    action?.()
  }

  public listenKey = () => {
    document.addEventListener("keydown", this.keyDown);
  }

  public updateSpeed() {
    this.ySpeed +=  
      (this.sketchOptions?.pixelMeterSize ?? 1) *
      this.gForce * 
      this.getFrameTime()
  }

  onDraw = () => {
    if(!this.ctx)
      return

    this.updateSpeed()
    this.yPos += this.getDistance(this.ySpeed)

    this.ctx.beginPath();
    this.ctx.arc(100, this.yPos, 50, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#fff";
    this.ctx.fill()
    this.ctx.stroke();
  };

  public jump = () => {
    this.ySpeed = -360
  }

  public destroy = () => {
    document.removeEventListener("keydown", this.keyDown);
  }
}