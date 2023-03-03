import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Pipes } from './lib/Pipes';
import { Player } from './lib/Player';
import { Sketch } from './lib/Sketch';


function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [play, setPlay]  = useState(false)
  const [points, setPoints]  = useState(0)

  useEffect(() => {
    if(!play)
      return

    if(!canvasRef.current)
      return

      
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");

    if(!ctx)
      return

    const height = 1000;
    ctx.canvas.height = height;
    ctx.canvas.width = height * 0.75;
    
    const sketch = new Sketch(canvas)
    const player = new Player()
    const pipes = new Pipes(player, () => setPoints(p => p + 1))

    player.listenKey()
    sketch.draw((res) => {
      player.draw(res)
      pipes.draw(res)

      const nextCoords = player.getNextCoords()
      const nearestPipe = pipes.getNearestPipe(nextCoords.x + player.boundingBox.width)
      
      const distanceFromPipe = nearestPipe.top.position.x - nextCoords.x - player.boundingBox.width

      const gameData = {
        x: nextCoords.x,
        y: nextCoords.y,
        distanceFromPipe: distanceFromPipe,
        pipeTopHeight: nearestPipe?.top.boundingBox.height, 
        pipeBottomHeight: nearestPipe?.bottom.boundingBox.height, 
      }

      if(pipes.isSomethingColliding(player) || sketch.isObjectOut(player)) {
        setPlay(false);
      }
    })

    return () => {
      sketch.destroy()
      player.destroy()
    }
  }, [canvasRef, play])

  return (
    <div className='game-container'>
      <canvas 
        ref={canvasRef}
        className='flappy-bird'
      ></canvas>
      <button
        onClick={() => setPlay(!play)}
      >
        {play ? 'stop' : 'play'}
      </button>
      <h1>
        {points}
      </h1>
    </div>
  );
}

export default App;