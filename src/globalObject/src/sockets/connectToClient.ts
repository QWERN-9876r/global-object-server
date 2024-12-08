import { Server } from 'socket.io'

import type { GlobalObject as GlobalObjectType } from '../GlobalObject'
import { id, serverConnections, serverWs } from '../symbols'
import { addListeners } from './'
import type { TGlobalObject } from '../types'

export function connectToClient<T extends object>(
    port: number,
    gObj: TGlobalObject<T>,
    GlobalObject: typeof GlobalObjectType
) {
    GlobalObject.config.server.listen(port, () => {
        const io = new Server(GlobalObject.config.server, {
            cors: GlobalObject.config.cors,
        })

        gObj[serverWs] = io

        io.on('connection', (socket) => {
            io.emit('add', {
                id: gObj[id],
                current: gObj.getStaticObject(),
            })

            gObj[serverConnections].push(socket)

            addListeners(socket, gObj, GlobalObject)
        })
    })
}
