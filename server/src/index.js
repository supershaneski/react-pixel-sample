const express = require('express')
const app = express()
const path =require('path')
const http = require('http')
const server = http.createServer(app)

require('dotenv').config()

const { MongoClient, ObjectId } = require('mongodb')

const { Server } = require('socket.io')

const Events = {
    LIST: 'list-pixel',
    ADD: 'add-pixel',
}

const io = new Server(server, {
    cors: {
        origin: `http://${process.env.APP_IPADDR}:${process.env.APP_PORT}`,
        methods: ["GET", "POST"]
    }
})

var db

MongoClient.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err, database) => {
    if (err) return console.log('MongoDB', err)
    db = database.db(process.env.DB_NAME)
})

//app.use('/', express.static(path.join(__dirname, 'root')))
app.get('/', (req, res) => res.send('<h1>This is the server</h1>'))

io.on('connection', (socket) => {

    socket.on(Events.LIST, async () => {

        const ret = await db.collection(`${process.env.DB_COLNAME}`).find().toArray()

        socket.emit(Events.LIST, { items: ret })

    })

    socket.on(Events.ADD, async ({ x, y, color }) => {

        const item = {
            uid: socket.id,
            x,
            y,
            color,
            datetime: (new Date()).toISOString(),
        }

        const ret = await db.collection(`${process.env.DB_COLNAME}`).insertOne(item)

        io.emit(Events.ADD, { x, y, color })
        
    })

    socket.on('disconnect', () => {

        console.log('user disconnected', socket.id)
        
    })

})

server.listen(4000, () => {
    console.log("Starting Socket.io Server", (new Date()).toLocaleTimeString())
    console.log("Listening on *:4000")
})
