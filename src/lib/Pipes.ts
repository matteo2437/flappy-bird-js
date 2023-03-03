import { CollisionableObject } from "./CollisionableObject"
import { Drawable } from "./Drawable"
import { PipePiece } from "./PipePiece"
import { Player } from "./Player"

export interface Pipe {
  readonly top: PipePiece,
  readonly bottom: PipePiece,
}

export class Pipes extends Drawable {
  private readonly pipeGap = 300
  private readonly pipeDistance = 500
  private readonly pipeWidth = 150
  private xDelta = 0 
  private xSpeed: number;

  private pipes: Pipe[] = []

  constructor(player: Player) {
    super()

    this.xSpeed = player.xSpeed;
  }

  public isSomethingColliding(obj: CollisionableObject) {
    return this.pipes
      .some(p =>
        p.bottom.isColliding(obj) ||
        p.top.isColliding(obj)
      )
  }

  private getStartX = (pipeIndex: number) => {
    return pipeIndex * 
      this.pipeDistance + 
      this.pipeWidth + 
      (this.canvas?.width ?? 0)
  }

  private init = () => {
    this.pipes = [...Array(4)]
      .map((_, i) => ({
        top: new PipePiece({ x: this.getStartX(i), y: 0 }),
        bottom: new PipePiece({ x: this.getStartX(i), y: 0 }),
      }))
      .map(p => {
        p.bottom.boundingBox.width = this.pipeWidth
        p.top.boundingBox.width = this.pipeWidth

        return p
      })
      .map(this.setPipeTopHeight)
  }

  protected onDraw = () => {
    const isFirstCycle = !(this.pipes.length !== 0 || !this.canvas)
    if(isFirstCycle)
      this.init()
    
    this.xDelta = this.getDistanceFromSpeed(this.xSpeed)

    this.pipes
      .map(this.drawPipe)
      .map(this.moveFirstPipe)
  }

  private setPipeTopHeight = (pipe: Pipe) => {
    pipe.top.boundingBox.height = Math.random() * ((this.canvas?.height ?? 0) - this.pipeGap)
    
    const startY = pipe.top.boundingBox.height + this.pipeGap
    pipe.bottom.boundingBox.height = (this.canvas?.height ?? 0) - startY

    return pipe
  }

  private moveFirstPipe = (pipe: Pipe, _: number, pipes: Pipe[]) => {
    if(pipe.top.position.x + this.pipeWidth > 0)
      return pipe

    const furthestPipe = Math.max(...pipes.map(p => p.top.position.x))

    pipe.top.position.x = furthestPipe + this.pipeDistance
    return this.setPipeTopHeight(pipe)
  }

  private drawPipe = (pipe: Pipe) => {
    if(!this.ctx || !this.sketchRes)
      return pipe

    pipe.top.position.x = pipe.top.position.x - this.xDelta
    pipe.top.position.y = 0

    pipe.top.draw(this.sketchRes);


    pipe.bottom.position.x = pipe.top.position.x
    pipe.bottom.position.y = pipe.top.boundingBox.height + this.pipeGap
    pipe.bottom.boundingBox.height = (this.canvas?.height ?? 0) - pipe.bottom.position.y

    pipe.bottom.draw(this.sketchRes);

    return pipe
  }
}