import { startWebSocketConnection } from './ws';
import { startPollingComputer, computer } from './devices/computer/device';
import { startPollingLedTree, ledTree } from './devices/usb/device';

export interface DeviceStatus {
    online: boolean; // Device is reachable
    state: boolean; // Controlled state
    changingTo?: boolean; // Device changing state
}
export interface Device {
    name: string;
    id: string;
    status: DeviceStatus;
    loading?: boolean;
    action: (state: boolean) => void;
    tags?: string[];
}

// Notify controllers device should be updated
export interface InternalDeviceUpdateRequest {
    name: Device['name'];
    id: Device['id'];
    requestedState: DeviceStatus['state'];
    updated?: boolean;
    tags?: Device['tags'];
}

// Controller reports new device state
export interface InternalDeviceUpdate {
    name: Device['name'];
    id: Device['id'];
    status: DeviceStatus;
}

export const devices = new Map<Device['id'], Device>([
    ['computer', computer],
    ['led_tree', ledTree]
]);

export const updateDevice = (update: InternalDeviceUpdateRequest) => {
    devices.get(update.id)?.action(update.requestedState);
};

const main = async () => {
    startWebSocketConnection();

    startPollingComputer();
    startPollingLedTree();
};

main();
