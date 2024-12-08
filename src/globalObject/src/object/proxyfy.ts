import type { TGlobalObject } from '../types'
import { id, serverWs, shouldReSend, staticObject } from '../symbols'

const PROXY_OBJECT = {
    set<T extends object>(
        target: TGlobalObject<T>,
        propertyKey: PropertyKey,
        value: T[keyof T],
        receiver?: any
    ) {
        if (typeof propertyKey === 'symbol') {
            return Reflect.set(target, propertyKey, value, receiver)
        }

        if (target[shouldReSend]) {
            target[serverWs]?.sockets.emit('update', {
                id: target[id],
                key: propertyKey,
                value,
            })
        }

        if (!target[staticObject]) {
            target[staticObject] = {} as T
        }

        const res1 = Reflect.set(
            target[staticObject] as T,
            propertyKey,
            value,
            receiver
        )

        const res2 = Reflect.set(target, propertyKey, value, receiver)

        return res1 && res2
    },
}

export function proxyfy<T extends object>(obj: T | null) {
    return (obj === null ? {} : new Proxy(obj, PROXY_OBJECT)) as TGlobalObject<
        T | {}
    >
}
