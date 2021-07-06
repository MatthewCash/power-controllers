import WebSocket from 'ws';
import { devices, InternalDeviceUpdateRequest, updateDevice } from './main';

let ws: WebSocket;

export const connected = () => ws?.readyState === WebSocket.OPEN;

const connect = async () => {
    if (connected()) ws.close();

    ws = new WebSocket(process.env.DEVICES_WS_URL);

    ws.on('open', onOpen);
    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);

    await new Promise(r => ws.once('open', r));
};

const onOpen = () => {
    console.log('Devices WebSocket Connected!');

    const simpleDevices = [...devices.values()]
        .map(({ name, id, status }) => ({ name, id, status }))
        .filter(device => device.status !== null);

    simpleDevices.forEach(device =>
        sendMessage({ internalDeviceUpdate: device })
    );
};

const onMessage = (message: WebSocket.Data) => {
    let data;
    try {
        data = JSON.parse(message.toString());
    } catch {
        return ws.send('Invalid JSON!');
    }

    if (data['internalDeviceUpdateRequest']) {
        const update = data[
            'internalDeviceUpdateRequest'
        ] as InternalDeviceUpdateRequest;

        updateDevice(update);
    }
};

const onError = (error: Error) => {
    console.warn(error);
};

const onClose = () => {
    console.log('Devices WebSocket Disconnected!');
};

export const startWebSocketConnection = () => {
    setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) return;
        connect();
    }, 3000);

    return connect();
};

export const sendMessage = (data: any) => {
    ws.send(JSON.stringify(data));
};
