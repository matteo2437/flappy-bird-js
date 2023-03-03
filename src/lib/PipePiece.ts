import { Coords } from "../abstractions/Coords";
import { CollisionableObject } from "./CollisionableObject";

export class PipePiece extends CollisionableObject {
  public xSpeed = 0;
  public ySpeed = 0;

  constructor(public position: Coords) {
    super()
    this.position = position
  }
  
  protected onDraw = () => {
    if(!this.ctx)
      return

    this.ctx.beginPath();
    this.ctx.rect(
      this.position.x, 
      this.position.y, 
      this.boundingBox.width, 
      this.boundingBox.height
    );
    this.ctx.fillStyle = "blue";
    this.ctx.fill();
  };
}
