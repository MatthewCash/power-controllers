import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/control', async (req, res, next) => {
    const data = req.body;
    if (!data) return res.send('Invalid Body!');

    // Computer
    if (data.computer != null) {
        if (data.computer) {
            exec(
                '/usr/bin/sudo /usr/bin/bash /opt/power-controllers/computer/on.sh'
            );
        } else {
            exec(
                '/usr/bin/sudo /usr/bin/bash /opt/power-controllers/computer/off.sh'
            );
        }
    }

    // USB Power
    if (data.usb != null) {
        if (data.usb) {
            exec(
                '/usr/bin/sudo /usr/bin/bash /opt/power-controllers/usb/on.sh'
            );
        } else {
            exec(
                '/usr/bin/sudo /usr/bin/bash /opt/power-controllers/usb/off.sh'
            );
        }
    }
});

app.listen(process.env.PORT ?? 8080);
console.log('Listening...');
