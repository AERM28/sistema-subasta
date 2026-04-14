import Pusher from 'pusher-js';

class PusherService {
    constructor() {
        this.pusher = null;
        this.channels = {};
    }

    initialize() {
        if (this.pusher) return this.pusher;
        this.pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
            encrypted: true,
        });
        return this.pusher;
    }

    subscribe(channel) {
        if (!this.pusher) this.initialize();
        if (!this.channels[channel]) {
            this.channels[channel] = this.pusher.subscribe(channel);
        }
        return this.channels[channel];
    }

    unsubscribe(channel) {
        if (this.channels[channel]) {
            this.pusher.unsubscribe(channel);
            delete this.channels[channel];
        }
    }

    bind(channel, event, callback) {
        const pusherChannel = this.subscribe(channel);
        pusherChannel.bind(event, callback);
    }

    // callback es opcional: si se pasa, quita solo ese listener;
    // si no se pasa, quita todos los listeners del evento.
    unbind(channel, event, callback) {
        if (this.channels[channel]) {
            if (callback) {
                this.channels[channel].unbind(event, callback);
            } else {
                this.channels[channel].unbind(event);
            }
        }
    }

    disconnect() {
        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
            this.channels = {};
        }
    }
}

export default new PusherService();