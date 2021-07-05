import os from 'os';
import { Device, InternalDeviceUpdate } from '../../main';
import { sendMessage } from '../../ws';

export const device: Device = {
    name: 'Computer',
    id: 'computer',
    status: null
};

const isEth0Connected = () => !!os.networkInterfaces()['eth0'];

const pollStatus = () => {
    const newStatus = isEth0Connected();

    if (newStatus === device.status) return;

    device.status = newStatus;
    sendUpdate();
};

const sendUpdate = () => {
    const internalDeviceUpdate: InternalDeviceUpdate = device;

    sendMessage({ internalDeviceUpdate });
};

export const startPollingComputer = () => {
    setInterval(pollStatus, 100);
    pollStatus();
};
