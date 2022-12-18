import { BoundingBox } from "../abstractions/BoundingBox";
import { Coords } from "../abstractions/Coords";
import { Drawable } from "./Drawable";

export abstract class CollisionableObject extends Drawable {
  public position: Coords = {
    x: 0,
    y: 0
  };
  
  public boundingBox: BoundingBox = {
    height: 100,
    width: 100,
  };

  public isCollaiding(obj: CollisionableObject) {
    const startX = this.position.x
    const endX = startX + this.boundingBox.width

    const startY = this.position.y
    const endY = startY + this.boundingBox.height

    const objStartX = obj.position.x
    const objEndX = objStartX + obj.boundingBox.width

    const objStartY = obj.position.y
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