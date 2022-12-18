import { useEffect, useRef } from 'react';
import { BoundingBox } from './abstractions/BoundingBox';
import './App.css';
import { CollisionableObject } from './lib/CollisionableObject';
import { Pipes } from './lib/Pipes';
import { Player } from './lib/Player';
import { Sketch } from './lib/Sketch';

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
      ctx.canvas.width = window.innerHeight * 0.75 ;

      player.draw(res)
      pipes.draw(res)

      if(pipes.isSomethingCollaiding(player))
        alert( )
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

export default App;