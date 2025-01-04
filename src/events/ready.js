"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (client) => {
    client.once('ready', () => {
        console.log('Bot is online!');
    });
};
