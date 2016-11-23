import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import Ansible from 'node-ansible';
import Path from 'path';

const fs = require('fs');
const ejs = require('ejs');
const spawn = require('child_process').spawn;

function generateFile(templatePath, data, destinationPath, callback) {
  ejs.renderFile(templatePath, data, null, (err, newStr) => {
    if(err) throw  err;
    fs.writeFile(destinationPath, newStr, 'utf-8', (err) => {
      if (err) throw err;
      callback();
    });
  });
}

ipcMain.on('run-ansible', (event, arg) => {
  arg = JSON.parse(arg);
  console.log(arg);

  try {
    const keyFilePath = arg.keyFilePath;
    const gitUsername = arg.gitUsername;
    const gitPassword = arg.gitPassword;

    const apiServerAddresses = arg.apiServerAddresses;
    const apiStack = arg.apiStack;

    const slaveAddress = arg.slaveAddress;
    const masterAddress = arg.masterAddress;

    const gitAddress = arg.gitAddress;

    const cacheServerAddresses = arg.cacheServerAddresses;

    const monitoringAddress = arg.monitoringAddress;
    const monitoringStack = arg.monitoringStack;

    const playbook_file = Path.join(__dirname, 'ansible', 'server.yml');
    const inventory_file = Path.join(__dirname, 'ansible', 'hosts');
    const deploy_code_vars = Path.join(__dirname, 'ansible', 'deploy-code', 'vars', 'main.yml');
    const info_template_vars = Path.join(__dirname, 'ansible', 'deploy-code', 'templates', 'info.conf');

    generateFile(Path.join(__dirname, 'ansible', 'ejs-template', 'hosts'), {
      apiServerAddresses,
      masterAddress,
      slaveAddress,
      cacheServerAddresses,
      monitoringAddress,
    }, inventory_file, () => {
      generateFile(Path.join(__dirname, 'ansible', 'ejs-template', 'server.yml'), {
        masterAddress,
        apiStack,
        monitoringStack,
      }, playbook_file, () => {
        generateFile(Path.join(__dirname, 'ansible', 'ejs-template', 'deploy-vars.yml'), {
          gitAddress,
          gitUsername,
          gitPassword,
        }, deploy_code_vars, () => {
          generateFile(Path.join(__dirname, 'ansible', 'ejs-template', 'info.conf'), {
            cacheServerAddresses: cacheServerAddresses.join(' '),
            masterAddress,
          }, info_template_vars, () => {
            generateFile(Path.join(__dirname, 'ansible', 'ejs-template', 'monitoring-vars.yml'), {
              monitoringAddress,
            }, Path.join(__dirname, 'ansible', 'vars', 'vars', 'main.yml'), () => {

              const option = ['-i', inventory_file, '-s', '-u', 'ubuntu', '--private-key', keyFilePath, playbook_file];
              const ansible = spawn('ansible-playbook', option);

              ansible.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
                event.sender.send('stdout', data.toString())
              });

              ansible.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
              });
            });
          });
        });
      });
    });
  } catch(e) {
    console.log('err :', e);
  }
});

require('./settings').menu(app);
