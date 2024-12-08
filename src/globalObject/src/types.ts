import type { Server, Socket as ServerSocket } from 'socket.io'
import type { Socket } from 'socket.io-client'

import type {
    connections,
    id,
    serverConnections,
    serverWs,
    shouldReSend,
    staticObject,
} from './symbols'

export type TGlobalObject<T extends object> = T & {
    [staticObject]: T | null
    [id]: string
    [serverWs]: Server | null
    [serverConnections]: ServerSocket[]
    [connections]: Socket[]
    [shouldReSend]: boolean
    getStaticObject: () => T | null
    remove: () => void
}

export interface AddConnection {
    id: string
    countConnections: number
    hostName: string
}
