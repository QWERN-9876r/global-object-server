import { GlobalObject } from './globalObject'

import express from 'express'
import { createServer } from 'node:http'

interface Message {
    author: string
    text: string
    time: number
}

const app = express()

app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header(
        'Access-Control-Allow-Methods',
        'PUT, GET, POST, DELETE, OPTIONS'
    )
    next()
})

const server = createServer(app)

GlobalObject.config.server = server

const gObj = GlobalObject.create([
    {
        author: 'Bob',
        text: 'Бу',
        time: Date.now(),
    },
    {
        author: 'Alice',
        text: 'Не бойся',
        time: Date.now() + 10000,
    },
] satisfies Message[])

GlobalObject.send(gObj, 3003)
