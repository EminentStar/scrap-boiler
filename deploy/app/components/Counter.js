// @flow
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
const { ipcRenderer } = require('electron')
import styles from './Counter.css';

class Counter extends Component {

  constructor() {
    super();

    this.state = {
      terminal: [],
    };

    this.renderTerminalRow = this._renderTerminalRow.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('stdout', (event, arg) => {
      console.log(arg);

      const terminalTemp = this.state.terminal;
      terminalTemp.push(arg);
      this.setState({
        terminal: terminalTemp,
      });
    });
  }

  _renderTerminalRow(msg, index)  {
    return (
      <div
        className={styles.terminal_row}
        key={index}
      >
        <i className="fa fa-check"/> {msg}
      </div>
    )
  }
  render() {
    const { terminal } = this.state;
    return (
      <div className={styles.terminal}>
        <div className={styles.gradient_line}></div>
        <Link
          to="/"
          className={styles.arrow_left}
        >
          <i className="fa fa-arrow-left" />
        </Link>
        {_.map(terminal, this.renderTerminalRow)}
      </div>
    );
  }
}

export default Counter;
