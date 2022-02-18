import { exec } from 'child_process';
import { Device, InternalDeviceUpdate } from '../../main';
import { connected, sendCommands } from '../../ws';

export const ledTree: Device = {
    name: 'LED Tree',
    id: 'led_tree',
    status: {
        online: false,
        state: false,
        changingTo: null
    },
    action: async status => {
        const onOff = status ? 'on' : 'off';

        await new Promise(resolve =>
            exec(`/usr/sbin/uhubctl -a ${onOff} -l 1-1 -p 2`, resolve)
        );

        pollStatus();
    }
};

const isUsbPowered = async () => {
    const onOff = await new Promise<string>(r =>
        exec(
            `uhubctl -l 1-1 -p 2 | head -n 2 | tail -n 1 | awk '{print $NF}'`,
            (error, stdout) => r(stdout)
        )
    );

    return onOff.trim() === 'power';
};

const pollStatus = async () => {
    const newStatus = await isUsbPowered();

    if (newStatus === ledTree?.status?.state) return;
    if (!connected()) return;

    ledTree.status.changingTo = null;
    ledTree.status.online = true;
    ledTree.status.state = newStatus;

    sendUpdate();
};

const sendUpdate = () => {
    const internalDeviceUpdate: InternalDeviceUpdate = {
        name: ledTree.name,
        id: ledTree.id,
        status: ledTree.status
    };

    sendCommands({ internalDeviceUpdate });
};

export const startPollingLedTree = () => {
    setInterval(pollStatus, 1000);
    pollStatus();
};
function r() {
    throw new Error('Function not implemented.');
}
