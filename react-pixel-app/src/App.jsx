import React from 'react'
import reactLogo from './assets/react.svg'
import classes from './App.module.css'

import { io } from 'socket.io-client'


function hexToRGB(hex) {

  var m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)

  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  }
}


function App() {

  const socket = React.useRef()
  const canvasRef = React.useRef()

  const [count, setCount] = React.useState(1)
  const [posX, setPosX] = React.useState(0)
  const [posY, setPosY] = React.useState(0)

  React.useEffect(() => {

    console.log("mounted...")

    //console.log(import.meta.env.VITE_SOME_KEY)

    canvasRef.current.width = 512
    canvasRef.current.height = 512

    var ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, 512, 512)

    socket.current = io("ws://192.168.1.80:4000")

    canvasRef.current.addEventListener("mouseup", (e) => {
      e.preventDefault()
    })

    canvasRef.current.addEventListener("mousemove", (e) => {
      e.preventDefault()
    })

    canvasRef.current.addEventListener("mousedown", (e) => {

      e.preventDefault()

      let x = e.offsetX
      let y = e.offsetY

      if(count > 1) {

        const cx = 256 + posX
        const cy = 256 + posY

        x = Math.floor((x - cx)/count)
        y = Math.floor((y - cy)/count)

        x = cx + x
        y = cy + y

      }

      console.log("down", count, e.offsetX, e.offsetY, x, y)
      
      if(x > 512) return
      if(x < 0) return

      if(y > 512) return
      if(y < 0) return

      const ctx = canvasRef.current.getContext('2d')
      let pixel = ctx.getImageData(x, y, 1, 1)
      console.log("pixel", x, y, pixel.data)

      const colors = [
        "#D31E25",
        "#D7A32E",
        "#D1C02B",
        "#369E4B",
        "#5DB5B7",
        "#31407B",
        "#8A3F64",
        "#4F2E39",
      ]

      const color = colors[Math.floor((colors.length - 1) * Math.random())]

      socket.current.emit('add-pixel', { x, y, color })

    })

    socket.current.on("connection", () => {
      console.log("connected to the server yo!")
    })

    socket.current.on("list-pixel", (resp) => {
      
      console.log("list-pixel", resp)

      

      const ctx = canvasRef.current.getContext('2d')

      resp.items.forEach((item) => {

        const rgb = hexToRGB(item.color.slice(1))

        let arr = new Uint8ClampedArray(4)
        arr[0] = rgb.r
        arr[1] = rgb.g
        arr[2] = rgb.b
        arr[3] = 255

        let imgData = new ImageData(arr, 1)
        
        ctx.putImageData(imgData, item.x, item.y)

      })
      

    })

    socket.current.on("add-pixel", (resp) => {

      console.log("add-pixel", resp)

      const ctx = canvasRef.current.getContext('2d')

      const rgb = hexToRGB(resp.color.slice(1))

      let arr = new Uint8ClampedArray(4)
      arr[0] = rgb.r
      arr[1] = rgb.g
      arr[2] = rgb.b
      arr[3] = 255

      let imgData = new ImageData(arr, 1)
      
      ctx.putImageData(imgData, resp.x, resp.y)
      
    })

    socket.current.emit('list-pixel')

  }, [])

  const handleAddPixel = () => {

    const x = Math.round(512 * Math.random())
    const y = Math.round(512 * Math.random())
    
    const colors = [
        "#D31E25",
        "#D7A32E",
        "#D1C02B",
        "#369E4B",
        "#5DB5B7",
        "#31407B",
        "#8A3F64",
        "#4F2E39",
    ]

    const color = colors[Math.floor((colors.length - 1) * Math.random())]

    const rgb = hexToRGB(color.slice(1))

    let arr = new Uint8ClampedArray(4)
    arr[0] = rgb.r
    arr[1] = rgb.g
    arr[2] = rgb.b
    arr[3] = 255

    let imgData = new ImageData(arr, 1)
    
    const ctx = canvasRef.current.getContext('2d')
    ctx.putImageData(imgData, x, y)

    socket.current.emit('add-pixel', { x, y, color })

  }

  const handleZoom = (mode) => () => {

    if(mode > 0) {

      setCount(10)

    } else {

      setCount(1)

      setPosX(0)
      setPosY(0)

    }
  }

  const handleMoveUpDown = (inc) => () => {

    console.log("updown", inc, posY)

    if(count > 1) {
      setPosY(py => py + (inc * count))
    }

  }

  const handleMoveLeftRight = (inc) => () => {

    console.log("leftright", inc, posX)

    if(count > 1) {
      setPosX(px => px + (inc * count))
    }

  }

  return (
    <div className={classes.App}>
      <div className={classes.card}>
        <button onClick={handleZoom(1)}>
          Zoom In
        </button>
        <button onClick={handleZoom(0)}>
          Zoom Out
        </button>
      </div>
      <div className={classes.container}>
        <div style={{
          transform: `scale(${count}, ${count}) translate(${posX}px, ${posY}px)`,
          imageRendering: 'crisp-edges',
        }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div className={classes.card}>
        <button onClick={handleMoveUpDown(1)}>Up {posY}</button>
        <button onClick={handleMoveUpDown(-1)}>Down {posY}</button>
        <button onClick={handleMoveLeftRight(1)}>Left {posX}</button>
        <button onClick={handleMoveLeftRight(-1)}>Right {posX}</button>
      </div>
    </div>
  )
}

export default App
