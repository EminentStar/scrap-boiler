// @flow
import React, { Component } from 'react';
const { ipcRenderer } = require('electron')
import { Link } from 'react-router';
import styles from './Home.css';
import TagsInput from 'react-tagsinput';
import CheckBoxList from 'react-checkbox-list';
import FileInput from 'react-file-input';
import _ from 'lodash';

const apiStackDefault = [
  { label: 'nginx', value: 'nginx', checked: true, },
  { label: 'gunicorn', value: 'gunicorn', checked: true, },
  { label: 'python', value: 'python', checked: true, },
  { label: 'telegraf', value: 'telegraf', checked: true, },
];

const monitoringStackDefault = [
  { label: 'influxdb', value: 'influxdb', checked: true, },
  { label: 'telegraf', value: 'telegraf', checked: true, },
  { label: 'grafana', value: 'grafana', checked: true, },
];

export default class Home extends Component {
  constructor() {
    super();

    this.state = {
      apiServerAddresses: ['52.78.242.61', '52.78.235.202'],
      apiStack: ['nginx', 'gunicorn', 'python', 'telegraf'],

      keyFilePath: '/Users/bowbowbow/Desktop/key/soma.pem',
      gitUsername: 'clsrn1581',
      gitPassword: 'dbs3121581',
      gitAddress: 'bitbucket.org/soma2016_scrap/scrap.git',

      cacheServerAddresses: ['52.78.196.76', '52.78.152.149'],

      masterAddress: '52.78.240.123',
      slaveAddress: '52.78.195.92',

      monitoringAddress: '52.78.92.247',
      monitoringStack: ['influxdb', 'grafana'],

      terminal: [],
    };

    this.handleApiCheckboxListChange = this._handleApiCheckboxListChange.bind(this);
    this.handleCacheAddressChange = this._handleCacheAddressChange.bind(this);

    this.handleMonitoringCheckboxListChange = this._handleMonitoringCheckboxListChange.bind(this);

    this.handleAddressChange = this._handleAddressChange.bind(this);
    this.handleFileChange = this._handleFileChange.bind(this);
    this.handleRunAnsible = this._handleRunAnsible.bind(this);
  }

  _handleAddressChange(apiServerAddresses) {
    this.setState({ apiServerAddresses });
  }

  _handleCacheAddressChange(cacheServerAddresses) {
    this.setState({ cacheServerAddresses });
  }

  _handleApiCheckboxListChange(apiStack) {
    this.setState({
      apiStack,
    });
  }

  _handleMonitoringCheckboxListChange(monitoringStack) {
    this.setState({
      monitoringStack,
    })
  }

  _handleFileChange(event) {
    this.setState({
      keyFilePath: event.target.files[0].path,
    });
  }

  _handleRunAnsible() {
    ipcRenderer.send('run-ansible', JSON.stringify(this.state));
  }

  render() {
    const { apiServerAddresses } = this.state;

    return (
      <div>
        <div className={styles.gradient_line}></div>
        <div className={styles.container1}>
          <div className={styles.title}> Scrape Server Deployment </div>

          <div className={styles.sub_title}> Auth</div>

          <div className={styles.form}>
            <div className={styles.form_label}>Key File</div>
            <div className={styles.form_content}>
              <FileInput
                accept=".pem,.ppk"
                placeholder="Select a key file"
                className={styles.keyFileInput}
                onChange={this.handleFileChange}
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Git Username</div>
            <div className={styles.form_content}>
              <input
                value={this.state.gitUsername}
                onChange={(e) => this.setState({ gitUsername: e.target.value })}
                placeholder="Input a git username"
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Git Password</div>
            <div className={styles.form_content}>
              <input
                value={this.state.gitPassword}
                onChange={(e) => this.setState({ gitPassword: e.target.value })}
                placeholder="Input a git password"
              />
            </div>
          </div>
        </div>

        <div className={styles.container2}>
          <div className={styles.sub_title}> API Servers</div>

          <div className={styles.form}>
            <div className={styles.form_label}>IP Addresses</div>
            <div className={styles.form_content}>
              <TagsInput
                value={apiServerAddresses}
                onChange={this.handleAddressChange}
                inputProps={{
                  className: 'react-tagsinput-input',
                  placeholder: 'Add an address'
                }}
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Stack</div>
            <div className={styles.form_content}>
              <CheckBoxList
                className={styles.stack_checkbox}
                ref="checkBox"
                defaultData={apiStackDefault}
                onChange={this.handleApiCheckboxListChange}
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Source Code</div>
            <div className={styles.form_content}>
              <input
                value={this.state.gitAddress}
                onChange={(e) => this.setState({ gitAddress: e.target.value })}
                placeholder="Input a git address"
              />
            </div>
          </div>
        </div>

        <div className={styles.container3}>
          <div className={styles.sub_title}> DB Servers</div>

          <div className={styles.form}>
            <div className={styles.form_label}>Master Address</div>
            <div className={styles.form_content}>
              <input
                value={this.state.masterAddress}
                onChange={(e) => this.setState({ masterAddress: e.target.value })}
                placeholder="Input an address"
              />
            </div>
          </div>
        </div>

        <div className={styles.container3}>
          <div className={styles.sub_title}> DB Servers</div>

          <div className={styles.form}>
            <div className={styles.form_label}>Master Address</div>
            <div className={styles.form_content}>
              <input
                value={this.state.masterAddress}
                onChange={(e) => this.setState({ masterAddress: e.target.value })}
                placeholder="Input an address"
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Slave Address</div>
            <div className={styles.form_content}>
              <input
                value={this.state.slaveAddress}
                onChange={(e) => this.setState({ slaveAddress: e.target.value })}
                placeholder="Input an address"
              />
            </div>
          </div>
        </div>

        <div className={styles.container4}>
          <div className={styles.sub_title}> Monitering Server</div>

          <div className={styles.form}>
            <div className={styles.form_label}>IP Address</div>
            <div className={styles.form_content}>
              <input
                value={this.state.monitoringAddress}
                onChange={(e) => this.setState({ monitoringAddress: e.target.value })}
                placeholder="Input an address"
              />
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.form_label}>Stack</div>
            <div className={styles.form_content}>
              <CheckBoxList
                className={styles.stack_checkbox}
                ref="checkBox"
                defaultData={monitoringStackDefault}
                onChange={this.handleMonitoringCheckboxListChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.container5}>
          <div className={styles.sub_title}> Cache Server</div>

          <div className={styles.form}>
            <div className={styles.form_label}>IP Addresses</div>
            <div className={styles.form_content}>
              <TagsInput
                value={this.state.cacheServerAddresses}
                onChange={this.handleCacheAddressChange}
                inputProps={{
                  className: 'react-tagsinput-input',
                  placeholder: 'Add an address'
                }}
              />
            </div>
          </div>

          <Link
            to="/counter"
            className={styles.ansible_run}
            onClick={this.handleRunAnsible}
          >
            Run
          </Link>
        </div>
      </div>
    );
  }
};


