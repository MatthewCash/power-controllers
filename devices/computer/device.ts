import os from 'os';
import { exec } from 'child_process';
import { Device, InternalDeviceUpdate } from '../../main';
import { connected, sendMessage } from '../../ws';

export const computer: Device = {
    name: 'Computer',
    id: 'computer',
    status: null,
    action: status => {
        const onOff = status ? 'on' : 'off';

        exec(
            `/usr/bin/sudo /usr/bin/bash /opt/power-controllers/devices/computer/${onOff}.sh`
        );
    }
};

const isEth0Connected = () => !!os.networkInterfaces()['eth0'];

const pollStatus = () => {
    const newStatus = isEth0Connected();

    if (newStatus === computer.status) return;
    if (!connected()) return;

    computer.status = newStatus;
    sendUpdate();
};

const sendUpdate = () => {
    const internalDeviceUpdate: InternalDeviceUpdate = computer;

    sendMessage({ internalDeviceUpdate });
};

export const startPollingComputer = () => {
    setInterval(pollStatus, 100);
    pollStatus();
};
