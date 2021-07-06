#!/bin/bash

set +e

ssh -o StrictHostKeyChecking=no remote-shutdown@zerofive -i /opt/power-controllers/computer/keys/id_linux_ed /usr/bin/sudo /usr/bin/systemctl suspend
ssh -o StrictHostKeyChecking=no Matthew@zerofive -i /opt/power-controllers/computer/keys/id_win_ed "C:\Users\Matthew\Scripts\pc_off.cmd"
