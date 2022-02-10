import WebSocket from 'ws';
import { devices, InternalDeviceUpdateRequest, updateDevice } from './main';

let ws: WebSocket;

const socketStatus = {
    alive: false,
    authorized: false
};

export const connected = () => ws?.readyState === WebSocket.OPEN;

const connect = async () => {
    if (connected()) ws.close();
    socketStatus.alive = false;

    ws = new WebSocket(process.env.DEVICES_WS_URL);

    ws.on('open', onOpen);
    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);

    ws.on('ping', () => (socketStatus.alive = true));

    await new Promise(r => ws.once('open', r));
};

const onOpen = () => {
    console.log('Devices WebSocket Connected!');
};

const sendControlledDevices = () => {
    const simpleDevices = [...devices.values()]
        .map(({ name, id, status }) => ({ name, id, status }))
        .filter(device => device.status !== null);

    simpleDevices.forEach(device =>
        sendCommands({ internalDeviceUpdate: device })
    );
};

const onAuthorized = () => {
    sendControlledDevices();
};

const onMessage = (message: WebSocket.Data) => {
    let data;

    try {
        data = JSON.parse(message.toString());
    } catch {
        return ws.send('Invalid JSON!');
    }

    console.log(data);

    if (data?.state?.authorized !== null) {
        // Client is not Authorized
        if (data?.state?.authorized === false) {
            const authToken = process.env.DEVICES_AUTHORIZATION as string;
            sendMessage({ auth: { authorization: authToken } });
        }

        // Client becomes Authorized
        if (data?.state?.authorized && !socketStatus.authorized) {
            onAuthorized();
        }

        socketStatus.authorized = data?.state?.authorized;
    }

    if (data?.commands?.['internalDeviceUpdateRequest']) {
        const update = data?.commands?.[
            'internalDeviceUpdateRequest'
        ] as InternalDeviceUpdateRequest;

        updateDevice(update);
    }

    if (data?.commands?.['requireStatus']) {
        const requiredDevices = data?.commands?.['requireStatus'] as string[];

        const simpleRequiredDevices = [...devices.values()]
            .map(({ name, id, status }) => ({ name, id, status }))
            .filter(device => device.status !== null)
            .filter(device => requiredDevices.includes(device.name));

        simpleRequiredDevices.forEach(device =>
            sendCommands({ internalDeviceUpdate: device })
        );
    }
};

const onError = (error: Error) => {
    console.warn(error);
};

const onClose = () => {
    socketStatus.alive = false;
    console.log('Devices WebSocket Disconnected!');
};

export const startWebSocketConnection = () => {
    setInterval(() => {
        if (socketStatus.alive) return;
        connect();
    }, 3000);

    return connect();
};

export const sendMessage = (data: any) => {
    ws.send(JSON.stringify(data));
};

interface Commands {
    [name: string]: any;
}

export const sendCommands = (commands: Commands) => {
    sendMessage({ commands });
};
