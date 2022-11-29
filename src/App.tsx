import { useEffect, useRef } from 'react';
import { Drawable } from './lib/Drawable';
import './App.css';
import { Player } from './lib/Player';
import { Sketch, SketchRes } from './lib/Sketch';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if(!canvasRef.current)
      return

      
    const canvas = canvasRef.current
    const sketch = new Sketch(canvas)
    const player = new Player()
    const pipes = new Pipes()
      
    player.listenKey()
    sketch.draw((res) => {
      const ctx = res.canvas.getContext("2d");

      if(!ctx)
        return

      ctx.canvas.height = window.innerHeight;
      ctx.canvas.width = window.innerHeight * 0.75;

      player.draw(res)
      pipes .draw(res)
    })

    return () => {
      sketch.destroy()
      player.destroy()
    }
  }, [canvasRef])

  return (
    <div className='game-container'>
      <canvas 
        ref={canvasRef}
        className='flappy-bird'
      ></canvas>
    </div>
  );
}



interface Pipe {
  readonly xPos: number,
  readonly topHeight: number,
}

class Pipes extends Drawable {
  private readonly pipeDistance = 300
  private readonly pipeWidth = 150
  private readonly xSpeed = 80
  private xDelta = 0 

  private pipes: Pipe[] = [...Array(4)]
    .map((_, i) => ({
      xPos: i * this.pipeDistance + this.pipeWidth,
      topHeight: Math.random() * 300
    }))

  onDraw = () => {
    this.xDelta = this.getDistance(this.xSpeed)

    this.pipes = this.pipes
      .map(this.drawPipe)
      .map(this.moveFirstPipe)
  }

  private moveFirstPipe = (pipe: Pipe, _: number, pipes: Pipe[]): Pipe => {
    if(pipe.xPos + this.pipeWidth > 0)
      return pipe

    const furthestPipe = Math.max(...pipes.map(p => p.xPos))
    return {
      xPos: furthestPipe + this.pipeDistance,
      topHeight: Math.random() * 300
    }
  }

  private drawPipe = (pipe: Pipe): Pipe => {
    if(!this.ctx)
      return pipe

    const xPos = pipe.xPos - this.xDelta

    this.ctx.beginPath();
    this.ctx.rect(xPos, 0, this.pipeWidth, pipe.topHeight);
    this.ctx.fillStyle = "blue";
    this.ctx.fill();

    return {
      ...pipe,
      xPos: xPos,
    }
  }
}

export default App;