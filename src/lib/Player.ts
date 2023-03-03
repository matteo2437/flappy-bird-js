import { CollisionableObject } from "./CollisionableObject";

export class Player extends CollisionableObject {
  public position = {
    x: 100,
    y: 0
  };
  
  public boundingBox = {
    height: 100,
    width: 100,
  };

  private readonly gForce = 9.81;

  public ySpeed = 0;
  public xSpeed = 2

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
      this.gForce * 
      this.getFrameTime()
  }

  onDraw = () => {
    if(!this.ctx)
      return

    this.updateSpeed()
    this.position.y = this.getNextCoords().y

    this.ctx.beginPath();
    this.ctx.arc(
      this.position.x + this.boundingBox.width / 2, 
      this.position.y + this.boundingBox.width / 2, 
      this.boundingBox.width / 2, 
      0, 
      2 * Math.PI
    );

    this.ctx.fillStyle = "#fff";
    this.ctx.fill()
    this.ctx.stroke();
  };

  public jump = () => {
    this.ySpeed = -4
  }

  public destroy = () => {
    document.removeEventListener("keydown", this.keyDown);
  }
}