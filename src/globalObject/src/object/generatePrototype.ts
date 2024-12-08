import { v7 as uuid } from 'uuid'

import {
    connections,
    id,
    serverConnections,
    serverWs,
    shouldReSend,
    staticObject,
} from '../symbols'
import type { TGlobalObject } from '../types'

function getStaticObject<T extends object>(this: TGlobalObject<T>) {
    return structuredClone(this[staticObject])
}

function remove<T extends object>(this: TGlobalObject<T>) {
    this[serverWs]?.emit('remove', {
        id: this[id],
    })

    this[serverWs]?.close()

    this[staticObject] = null
}

export function generatePrototype<T extends object>(obj: T) {
    return {
        [id]: uuid(),
        [serverWs]: null,
        [staticObject]: obj,
        [serverConnections]: new Array(),
        [connections]: new Array(),
        [shouldReSend]: false,

        getStaticObject,
        remove,
    }
}
