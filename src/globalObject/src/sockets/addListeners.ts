import { Socket as ServerSocket } from 'socket.io'
import { Socket } from 'socket.io-client'

import type { GlobalObject as GlobalObjectType } from '../GlobalObject'

import {
    connections,
    id,
    serverConnections,
    shouldReSend,
    staticObject,
} from '../symbols'
import { connect } from './'
import type { AddConnection, TGlobalObject } from '../types'

interface Remove {
    id: string
}

interface Update<T extends object> {
    id: string
    key: keyof T
    value: T[keyof T]
}

export function addListeners<T extends object>(
    ws: ServerSocket | Socket,
    gObj: TGlobalObject<T>,
    GlobalObject: typeof GlobalObjectType
) {
    const isServerSocket = ws instanceof ServerSocket

    ws.on('disconnect', () => {
        if (isServerSocket) {
            try {
                delete gObj[serverConnections][
                    gObj[serverConnections].indexOf(ws)
                ]
            } catch (e) {
                throw new Error('GlobalObject: error while disconnecting')
            }

            return
        }

        delete gObj[connections][gObj[connections].indexOf(ws)]
    })
    ws.on('update', (data: Update<T>) => {
        if ('key' in data) {
            if (!gObj || !gObj[staticObject]) {
                ;(gObj as TGlobalObject<T>)[staticObject] = {
                    [data.key]: data.value,
                } as T

                throw new Error(
                    'GlobalObject: attempt to update an object before adding it'
                )
            }

            gObj[shouldReSend] = false

            Reflect.set(gObj[staticObject], data.key, data.value)
            Reflect.set(gObj, data.key, data.value)

            if (isServerSocket) {
                gObj[serverConnections].forEach((socket) => {
                    socket.emit('update', data)
                })
            }

            gObj[shouldReSend] = true
        }
    })
    ws.on('remove', (data: Remove) => {
        if (!gObj || data.id !== gObj[id]) return

        gObj.remove()
    })

    ws.on('addConnection', (data: AddConnection) => {
        if (
            isServerSocket ||
            !gObj ||
            data.id !== gObj[id] ||
            data.countConnections <= gObj[connections].length
        )
            return

        connect(data.hostName, '', GlobalObject)
    })
}
