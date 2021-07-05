import { exec } from 'child_process';
import { startWebSocketConnection } from './ws';
import { startPollingComputer } from './actions/computer/polling';

export interface Device {
    name: string;
    id: string;
    status: boolean;
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

export const updateDevice = (update: InternalDeviceUpdateRequest) => {
    interface DeviceAction {
        [id: string]: (status: boolean) => void;
    }

    const deviceActions: DeviceAction = {
        computer: status => {
            const onOff = status ? 'on' : 'off';

            if (!status) return console.log('turning computer off!');

            exec(
                `/usr/bin/sudo /usr/bin/bash /opt/power-controllers/actions/computer/${onOff}.sh`
            );
        },
        led_tree: status => {
            const onOff = status ? 'on' : 'off';

            exec(
                `/usr/bin/sudo /usr/bin/bash /opt/power-controllers/actions/usb/${onOff}.sh`
            );
        }
    };

    deviceActions[update.id]?.(update.status);
};

const main = async () => {
    await startWebSocketConnection();

    startPollingComputer();
};

main();
