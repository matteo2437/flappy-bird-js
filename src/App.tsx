import { CSSProperties, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Subject, throttleTime } from 'rxjs';
import './App.css';
import { Pipes } from './lib/Pipes';
import { Player } from './lib/Player';
import { Sketch } from './lib/Sketch';


interface GameData {
  readonly y: number,
  readonly distanceFromPipe: number
  readonly pipeTopHeight: number, 
  readonly pipeBottomHeight: number, 
}

const stream = new Subject<GameData>() 


const getNormalizedValue = (value: number, range: { min: number, max: number }) => {
  const newValue = (value - range.min) / (range.max - range.min);

  return Math.min(newValue, 1) * 2 - 1; 
}

const random = () => {
  return (Math.random() * 2) - 1
}



interface Weight {
  value: number;
  flowValue: number;
} 

interface Neuron {
  readonly weights: Weight[];
  bias: number;
}
interface Layer {
  readonly neurons: Neuron[];
}
interface LayerCreate {
  readonly units: number;
  readonly inputShape?: number;
}

class Model {
  public lastInputs: number[] = [];
  public layers: Layer[] = [];

  public add(args: LayerCreate) {
    if(this.layers.length === 0 && !args.inputShape)
      throw Error('The first layer must have an inputShape!')

    const prevShape = this.layers.length === 0
      ? args.inputShape ?? 0
      : this.getLastLayer().neurons.length

    this.layers.push({
      neurons: [...Array(args.units)].map(() => this.initNeuron(prevShape))
    })
  }

  public getNeuronOutput(neuron: Neuron, inputs: number[]) {
    const z = this.getNeuronZ(inputs, neuron)
    return this.activationFunction(z)
  }

  public getOutput(inputs: number[]) {
    this.lastInputs = inputs

    return this.getOutputLayer(this.layers.length - 1, inputs)
  }

  private getOutputLayer(layerIndex: number, initialInputs: number[]): number[] {
    const layerInputs = layerIndex === 0
      ? initialInputs ?? []
      : this.getOutputLayer(layerIndex - 1, initialInputs)

    return this.layers[layerIndex]
      .neurons
      .map(n => this.getNeuronOutput(n, layerInputs))
  }

  private initNeuron(inputShape: number): Neuron {
    return {
      bias: random(),
      weights: this.initWeights(inputShape)
    }
  }

  private initWeights(inputShape: number): Weight[] {
    return [...Array(inputShape)].map((_, i) => {
      const value = random()
      return {
        value: value,
        flowValue: value,
      }
    })
  }

  private getLastLayer() {
    return this.layers[this.layers.length - 1]
  }

  private getNeuronZ(inputs: number[], neuron: Neuron) {
    if(inputs.length !== neuron.weights.length)
      throw Error(`The input shape ${inputs.length} must be equal to weights shape ${neuron.weights.length}`);
  
    const dotProduct = inputs.reduce((prev, curr, index) => {
      const flowValue = curr * neuron.weights[index].value;
      neuron.weights[index].flowValue = flowValue;

      return prev + flowValue
    }, 0)
    
    return dotProduct + neuron.bias;
  }

  private activationFunction(value: number) {
    return 1 / ( 1 + Math.exp(-value) )
  }

  public randomizeWeights(percent: number) {
    this.layers
      .forEach(l => {
        l.neurons.forEach(n => {
          n.bias = Math.random() > percent 
            ? n.bias
            : random()

          n.weights.forEach(w => {
            w.value = Math.random() > percent 
              ? w.value
              : random() 
          })
        })
      })
  }
}

const model = new Model()

model.add({ units: 4, inputShape: 4  })
model.add({ units: 4 })
model.add({ units: 1 })

console.log(model.layers)
//console.log(model.getOutput([random(), random(), random(), random()]))


const drawModel = (canvas?: HTMLCanvasElement | null) => {
  if(!canvas)
    return

  const ctx = canvas.getContext("2d");
  
  if(!ctx)
    return
    
  const height = 1000;
  const width = 600;
  
  ctx.canvas.height = height;
  ctx.canvas.width = width;
  
  
  const layerGap = 150
  const neuronGap = 32

  const neuronSize = 32
  const neuronColor = '#ff0000'


  const getNeuronCoords = (layerIndex: number, neuronIndex: number, neuronsNumber: number) => {
    const layerWidth = (neuronSize + neuronGap) * neuronsNumber
    const layerSideGap = (width - layerWidth) / 2

    return {
      x: layerSideGap + (neuronSize + neuronGap) * (neuronIndex + 1),
      y: (layerIndex + 1) * layerGap + neuronSize,
    }
  }


  model
    .layers
    .forEach((layer, layerIndex) => {

      layer
        .neurons
        .forEach((neuron, neuronIndex) => {
          const coords = getNeuronCoords(layerIndex, neuronIndex, layer.neurons.length)

          neuron
            .weights
            .forEach((w, index) => {
              const neuronToConnectCoords = getNeuronCoords(layerIndex - 1, index, neuron.weights.length)
              const width = ((w.flowValue + 1) / 2) * 3
            

              ctx.beginPath();
              ctx.moveTo(coords.x, coords.y)
              ctx.lineTo(neuronToConnectCoords.x, neuronToConnectCoords.y)
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = width;
              ctx.stroke()
              ctx.closePath()
            })

          ctx.beginPath();
          ctx.arc(
            coords.x, 
            coords.y, 
            neuronSize / 2, 
            0, 
            2 * Math.PI
          );
          ctx.fillStyle = neuronColor;
          ctx.fill();
          ctx.closePath()
        })
    })
}


function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelRef = useRef<HTMLCanvasElement>(null)
  const [play, setPlay]  = useState(false)
  const [points, setPoints]  = useState(0)

  useEffect(() => {
    const sub = stream
      .pipe(throttleTime(500))
      .subscribe(data => {
        console.clear()
        console.log(model.layers)
        console.table(data)
      })

    return () => sub.unsubscribe() 
  }, [])


  useEffect(() => {
    if(!play) {
      //setPlay(true)
      return
    }

    if(!canvasRef.current)
      return

    drawModel(modelRef.current)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");

    if(!ctx)
      return

    const height = 1000;
    const width = height * 0.75

    ctx.canvas.height = height;
    ctx.canvas.width = width;
    
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

      const gameData: GameData = {
        y: getNormalizedValue(nextCoords.y, { min: 0, max: height - player.boundingBox.height }),
        distanceFromPipe: getNormalizedValue(distanceFromPipe, { min: 0, max: width - nextCoords.x }),
        pipeTopHeight: getNormalizedValue(nearestPipe?.top.boundingBox.height, { min: 0, max: height }), 
        pipeBottomHeight: getNormalizedValue(nearestPipe?.bottom.boundingBox.height, { min: 0, max: height }), 
      }

      stream.next(gameData)
      const pred = model.getOutput(Object.values(gameData))[0]
      drawModel(modelRef.current)

      console.log(pred)
      if(pred > 0.5)
        player.jump()


      if(pipes.isSomethingColliding(player) || sketch.isObjectOut(player)) {
        setPlay(false);
        model.randomizeWeights(0.5)
      }
    })

    return () => {
      sketch.destroy()
      player.destroy()
    }
  }, [canvasRef, play, modelRef])

  return (
    <div className="container">
      <div className='game-container'>
        <canvas 
          ref={canvasRef}
          className='flappy-bird'
        />
        <div className='game-controls'>
          <button
            onClick={() => setPlay(!play)}
          >
            {play ? 'stop' : 'play'}
          </button>
          <h1>
            {points}
          </h1>
        </div>
      </div>
      <canvas
        ref={modelRef}
        className='model'
      />
    </div>
  );
}

export default App;