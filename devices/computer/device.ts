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

const isEth0Gigabit = async () => {
    const ethtoolResult = await new Promise<string>(resolve => {
        exec('/usr/sbin/ethtool eth0', (error, stdout) => resolve(stdout));
    });

    return ethtoolResult
        .split('\n')
        .some(line => line.trim() === 'Speed: 1000Mb/s');
};

const pollStatus = async () => {
    const newStatus = await isEth0Gigabit();

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
