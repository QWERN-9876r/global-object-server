import { createServer } from 'node:http'

import { shouldReSend } from './symbols'
import { connect, connectToClient } from './sockets'
import { generatePrototype, proxyfy } from './object'
import { TGlobalObject } from './types'

export class GlobalObject {
    static create<T extends object>(obj: T | null): TGlobalObject<T | {}> {
        const gObj = structuredClone(obj || new Object()) as TGlobalObject<
            T | {}
        >

        const prototype = generatePrototype(gObj)

        Object.setPrototypeOf(prototype, Object.getPrototypeOf(obj))

        Object.setPrototypeOf(gObj, prototype)

        const res = proxyfy(gObj)

        res[shouldReSend] = true

        return res
    }

    static config = {
        secure: false,
        server: createServer(),
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    }

    static get<T extends object>(
        host: string,
        path = ''
    ): Promise<TGlobalObject<T | {}>> {
        return connect(host, path, this)
    }

    static send<T extends object>(gObj: TGlobalObject<T>, port: number) {
        connectToClient(port, gObj, this)
    }
}
