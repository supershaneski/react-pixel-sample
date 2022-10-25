react-pixel-sample
===========

This project is my simple implementation of `r/place` pixel application based from this [writeup](https://www.redditinc.com/blog/how-we-built-rplace) by the creators.


# Motivation

Instead of making another chat app, I was looking for some more interesting project to implement `socket.io` in a `React` app.

# The Stack

This project is using the `MERNS` stack.

* MongoDB - for the database
* Express.js - framework for Node.js
* React - for the front end app
* Node.js - the web server
* Socket.io - for web socket

# Server

The server is very simple based from the [chat tutorial](https://socket.io/get-started/chat).

```javascript
const express = require('express')
const app = express()
const path =require('path')
const http = require('http')
const server = http.createServer(app)

require('dotenv').config()

const { Server } = require('socket.io')

const io = new Server(server, {
    cors: {
        origin: `http://${process.env.APP_IPADDR}:${process.env.APP_PORT}`,
        methods: ["GET", "POST"]
    }
})

app.get('/', (req, res) => {
    res.send('<h1>This is the server</h1>')
})


io.on('connection', (socket) => {

    console.log('user connected', socket.id)

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    })

    socket.on('list-pixel', () => {
        //
    })

    socket.on('add-pixel', () => {
        //
    })

})

server.listen(4000, () => {
    console.log(`Listening on *:4000`)
})
```

I am using `cors` since the front-end app is not served from the same server/port.

For the `web socket`, there are only two events:

* `list-pixel` - returns all the database entries
* `add-pixel` - adds new entry to the database and broadcast it to everyone

## Database

Each database entry has the following format:

```javascript
{ _id, uid, x, y, color, datetime }
```

where `color` is a `hex color` and `datetime` is in `ISO format`.


Using `MongoDB shell`(mongosh) to access the database

```javascript
...
const { MongoClient, ObjectId } = require('mongodb')


var db

MongoClient.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err, database) => {
    if (err) return console.log('MongoDB', err)
    db = database.db(process.env.DB_NAME)
})

...

    socket.on('list-pixel', async () => {
        
        const ret = await db.collection(`${process.env.DB_COLNAME}`).find().toArray()

        socket.emit('list-pixel', { items: ret })

    })

    socket.on('add-pixel', async ({ x, y, color }) => {
        
        const item = {
            uid: socket.id,
            x,
            y,
            color,
            datetime: (new Date()).toISOString(),
        }

        const ret = await db.collection(`${process.env.DB_COLNAME}`).insertOne(item)

        io.emit('add-pixel', { x, y, color })

    })

...

```

# React App

> This is a work in progress...


# Getting Started

Clone the repository and install the dependencies

```sh
$ git clone https://github.com/supershaneski/react-pixel-sample.git myproject

$ cd myproject

$ npm install
```

To run the server, create `.env` file, copy the variables from `.env.example` and supply your own database parameters.

```sh
$ cd server

$ npm start
```

This will start the server listening on port 4000.

To start the client app, open new terminal window

```sh
$ cd react-pixel-app

$ npm start
```

Open your browser to `http://localhost:5000/` to load the client page
