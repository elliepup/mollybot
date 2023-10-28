import { event, Events } from "../utils/events"

export default event(Events.ClientReady, ({ log }, client) => {
    return log(`Successfully signed in as ${client.user.username}.`)
})