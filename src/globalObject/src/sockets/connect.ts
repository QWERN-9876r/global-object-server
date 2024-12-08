import { io } from 'socket.io-client'

import type { GlobalObject as GlobalObjectType } from '../GlobalObject'
import { connections, id } from '../symbols'
import { addListeners } from './'
import type { TGlobalObject } from '../types'

interface Add<T extends object> {
    id: string
    current: T
}

export function connect<T extends object>(
    host: string,
    path: string,
    GlobalObject: typeof GlobalObjectType,
    secure = false
): Promise<TGlobalObject<T | {}>> {
    let gObj: TGlobalObject<T | {}> = GlobalObject.create(null)
    const ws = io((secure ? 'wss://' : 'ws://') + host + path)

    gObj[connections].push(ws)

    return new Promise((resolve, reject) => {
        ws.on('add', (data: Add<T>) => {
            try {
                gObj = GlobalObject.create(
                    'current' in data ? data.current : null
                )

                if (!gObj)
                    reject(
                        new Error(
                            'GlobalObject: Failed to create global object'
                        )
                    )

                gObj[id] = data.id

                resolve(gObj)
            } catch (e) {
                reject(e)
            }
        })

        addListeners(ws, gObj, GlobalObject)
    })
}
