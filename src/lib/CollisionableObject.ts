import { BoundingBox } from "../abstractions/BoundingBox";
import { Coords } from "../abstractions/Coords";
import { Drawable } from "./Drawable";

export abstract class CollisionableObject extends Drawable {

  abstract xSpeed: number;
  abstract ySpeed: number;

  public position: Coords = {
    x: 0,
    y: 0
  };
  
  public boundingBox: BoundingBox = {
    height: 100,
    width: 100,
  };

  public getNextCoords(): Coords {
    return {
      x: this.position.x + this.getDistanceFromSpeed(this.xSpeed),
      y: this.position.y +this.getDistanceFromSpeed(this.ySpeed),
    }
  }

  public isColliding(obj: CollisionableObject) {
    const nextCoords = this.getNextCoords() 
    const nextObjCoords = obj.getNextCoords() 

    const startX = nextCoords.x
    const endX = startX + this.boundingBox.width

    const startY = nextCoords.y
    const endY = startY + this.boundingBox.height

    const objStartX = nextObjCoords.x
    const objEndX = objStartX + obj.boundingBox.width

    const objStartY = nextObjCoords.y
    const objEndY = objStartY + obj.boundingBox.height

    const isStartXInside = 
      objStartX >= startX &&
      objStartX <= endX

    const isEndXInside = 
      objEndX >= startX &&
      objEndX <= endX

    const isXIntersacating = isStartXInside || isEndXInside

    const isStartYInside = 
      objStartY >= startY &&
      objStartY <= endY

    const isEndYInside = 
      objEndY >= startY &&
      objEndY <= endY 

    const isYIntersacating = isStartYInside || isEndYInside

    return isXIntersacating && isYIntersacating
  }
}