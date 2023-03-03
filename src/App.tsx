import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Pipes } from './lib/Pipes';
import { Player } from './lib/Player';
import { Sketch } from './lib/Sketch';


function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hit, setHit]  = useState(false)

  useEffect(() => {
    if(!canvasRef.current)
      return

      
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");

    if(!ctx)
      return

    ctx.canvas.height = 1000;
    ctx.canvas.width = 1000 * 0.75;
    
    const sketch = new Sketch(canvas)
    const player = new Player()
    const pipes = new Pipes(player)

    setHit(false)

    player.listenKey()
    sketch.draw((res) => {
      player.draw(res)
      pipes.draw(res)

      if(pipes.isSomethingColliding(player) || sketch.isObjectOut(player)) {
        setHit(true);
      }
    })

    return () => {
      sketch.destroy()
      player.destroy()
    }
  }, [canvasRef, hit])

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