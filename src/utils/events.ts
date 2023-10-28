import type { Client, ClientEvents, Awaitable } from "discord.js"
export { Events } from "discord.js"

export type LogMethod = (...args: unknown[]) => void
export type EventKeys = keyof ClientEvents

export interface EventProps {
    client: Client
    log: LogMethod
}

export type EventCallback<K extends EventKeys> = (props: EventProps, ...args: ClientEvents[K]) => Awaitable<unknown>

export interface Event<K extends EventKeys = EventKeys> {
    name: K
    callback: EventCallback<K>
}

export function event<K extends EventKeys>(name: K, callback: EventCallback<K>): Event<K> {
    return { name, callback }
}

export function registerEvents(client: Client, events: Event[]): void {
    for (const { name, callback} of events) {
        client.on(name, (...args) => {
            const log = console.log.bind(console, `[Event: ${name}]`)

            try {
                callback({ client, log }, ...args)
            } catch (error) {
                log("[Unhandled exception]:")
                log(error)
            }
        })
    }
}