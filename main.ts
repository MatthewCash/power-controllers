import { startWebSocketConnection } from './ws';
import { startPollingComputer, computer } from './devices/computer/device';
import { startPollingLedTree, ledTree } from './devices/usb/device';

export interface Device {
    name: string;
    id: string;
    status: boolean;
    action?: (status: boolean) => void;
}

export interface InternalDeviceUpdateRequest {
    name: Device['name'];
    id: Device['id'];
    status: Device['status'];
    updated?: boolean;
}

export interface InternalDeviceUpdate {
    name: Device['name'];
    id: Device['id'];
    status: Device['status'];
}

export const devices = new Map<Device['id'], Device>([
    ['computer', computer],
    ['led_tree', ledTree]
]);

export const updateDevice = (update: InternalDeviceUpdateRequest) => {
    devices.get(update.id)?.action(update.status);
};

const main = async () => {
    startWebSocketConnection();

    startPollingComputer();
    startPollingLedTree();
};

main();
