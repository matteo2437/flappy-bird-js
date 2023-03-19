import { CSSProperties, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Subject, throttleTime } from 'rxjs';
import './App.css';
import { Pipes } from './lib/Pipes';
import { Player } from './lib/Player';
import { Sketch } from './lib/Sketch';
import { cloneDeep } from 'lodash'
interface GameData {
  readonly y: number,
  readonly distanceFromPipe: number
  readonly pipeTopHeight: number, 
  readonly pipeBottomHeight: number, 
}

const stream = new Subject<GameData>() 


const getNormalizedValue = (value: number, range: { min: number, max: number }) => {
  const newValue = (value - range.min) / (range.max - range.min);

  return Math.min(newValue, 1); 
}

const random = () => {
  return (Math.random() * 10) - 5
}



interface Weight {
  value: number;
  flowValue: number;
} 

interface Neuron {
  readonly weights: Weight[];
  bias: number;
  value: number;
}
interface Layer {
  readonly neurons: Neuron[];
}
interface LayerCreate {
  readonly units: number;
  readonly inputShape?: number;
}

class Model {
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
    return this.getOutputLayer(this.layers.length - 1, inputs)
  }

  private getOutputLayer(layerIndex: number, initialInputs: number[]): number[] {
    const layerInputs = layerIndex === 0
      ? initialInputs ?? []
      : this.getOutputLayer(layerIndex - 1, initialInputs)

    return this.layers[layerIndex]
      .neurons
      .map(n => {
        const value = this.getNeuronOutput(n, layerInputs)
        n.value = value;        
        return value
      })
  }

  private initNeuron(inputShape: number): Neuron {
    return {
      value: 0,
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
    return 1 / ( 1 + Math.exp(-value))
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

model.add({ units: 5, inputShape: 4 })
model.add({ units: 5 })
model.add({ units: 2 })

//console.log(model.getOutput([random(), random(), random(), random()]))


const drawModel = (canvas: HTMLCanvasElement | null, model?: Model) => {
  if(!canvas || !model)
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
              const width = Math.abs((w.flowValue / 10) * 10)

              ctx.beginPath();
              ctx.moveTo(coords.x, coords.y)
              ctx.lineTo(neuronToConnectCoords.x, neuronToConnectCoords.y)
              ctx.strokeStyle = w.flowValue > 0 ? '#00ff00' : '#0000ff';
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
          ctx.fillStyle = neuron.value > 0.5
            ? `rgba(0, 255, 0, ${neuron.value})`
            : `rgba(0, 0, 255, ${neuron.value})`
          ctx.fill();
          ctx.closePath()
        })
    })
}

const createModels = (baseModel: Model, randomizeWeights = 0.1) => {
  const models = [...Array(agentsNum)].map(() => {
    const newModel = new Model()
    newModel.layers = cloneDeep(baseModel.layers); 
    newModel.randomizeWeights(randomizeWeights)

    return {
      model: newModel,
      points: 0,
      lostIndex: -1,
      lost: false
    }
  })

  models.pop()
  models.unshift({
    model: baseModel,
    points: 0,
    lostIndex: -1,
    lost: false
  })

  return models
}


const agentsNum = 1000
let models = createModels(model, 1)
let epoch = 0

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelRef = useRef<HTMLCanvasElement>(null)
  const [play, setPlay]  = useState(false)
  const [points, setPoints]  = useState(0)

  useEffect(() => {
    const sub = stream
      .pipe(throttleTime(500))
      .subscribe(data => {
        //console.clear()
        //models.forEach(m => console.log(m))
        //console.table(data)
      })

    return () => sub.unsubscribe() 
  }, [])


  useEffect(() => {
    if(!play) {
      setPlay(true)
      return
    }

    if(!canvasRef.current)
      return

    //drawModel(modelRef.current)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");

    if(!ctx)
      return

    epoch++;
    console.log("epoch - " + epoch)

    const height = 1000;
    const width = height * 0.75

    ctx.canvas.height = height;
    ctx.canvas.width = width;
    
    const sketch = new Sketch(canvas)

    const players = [...Array(agentsNum)].map(() => new Player())
    const pipes = new Pipes(players[0].xSpeed, () => {
      models.forEach(m => {
        if(m.lost)
          return

        m.points = m.points + 1
      })
      setPoints(p => p + 1)
    })

    //player.listenKey()
    sketch.draw((res) => {
      pipes.draw(res)

      players.forEach((p, index) => {
        if(models[index].lost)
          return

        p.draw(res)
        const nextCoords = p.getNextCoords()
        const nearestPipe = pipes.getNearestPipe(nextCoords.x + p.boundingBox.width)
        
        const distanceFromPipe = 
          nearestPipe.top.position.x -
          nearestPipe.top.boundingBox.width + 
          nextCoords.x


        const gameData: GameData = {
          y: getNormalizedValue(nextCoords.y, { min: 0, max: height - p.boundingBox.height }),
          distanceFromPipe: getNormalizedValue(distanceFromPipe, { min: 0, max: width - nextCoords.x }),
          pipeTopHeight: getNormalizedValue(nearestPipe?.top.boundingBox.height, { min: 0, max: height }), 
          pipeBottomHeight: getNormalizedValue(nearestPipe?.bottom.boundingBox.height, { min: 0, max: height }), 
        }
  
        stream.next(gameData)
        const pred = models[index].model.getOutput(Object.values(gameData))
        drawModel(modelRef.current, models.find(m => m.lostIndex === -1)?.model)
  
        const jump = (pred[0] + 1) / 2
        const notJump = (pred[1] + 1) / 2
        if(jump > notJump)
          p.jump()

        if(pipes.isSomethingColliding(p) || sketch.isObjectOut(p)) {
          models[index].lost = true;
          models[index].lostIndex = Math.max(...models.map(m => m.lostIndex)) + 1
        }
      })

      if(models.every(m => m.lost)) {
        const bestModel = models.reduce((prev, current) => {
          return (prev.lostIndex > current.lostIndex) 
            ? prev 
            : current
        })
        
        const percentage = Math.pow(((epoch / 2) + 1), - 1)/2
        console.log("lr - " + percentage)
        console.log("points - " + bestModel.points)

        models = [...createModels(bestModel.model, percentage)]
        setPlay(false);
        setPoints(0)
      }
    })

    return () => {
      sketch.destroy()
      players.forEach(p => p.destroy())
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