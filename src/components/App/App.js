/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component, PropTypes } from 'react';
import s from './App.scss';
import globalCss from '../../styles/globalCss.scss';
import HeaderContainer from '../../containers/HeaderContainer';
import FooterContainer from '../../containers/FooterContainer';
import NotificationListContainer from '../../containers/NotificationListContainer';
import ModalSectionContainer from '../../containers/ModalSectionContainer';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

class App extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
    messageReceived: PropTypes.func.isRequired,
    error: PropTypes.object,
    wsPort: PropTypes.number.isRequired,
    shouldScrollToTop: PropTypes.bool.isRequired,
    scrolledToTop: PropTypes.func.isRequired
  };

  static contextTypes = {
    insertCss: PropTypes.func,
  };

  componentWillMount() {
    this.removeAppCss = this.context.insertCss(s);
    this.removeGlobalCss = this.context.insertCss(globalCss);
    if (canUseDOM) {
      let host = window.location.host;
      if (this.props.wsPort !== 0 && this.props.wsPort !== window.location.port) {
        host = `${window.location.hostname}:${this.props.wsPort}`;
      }
      let protocol = 'ws:';
      if (window.location.protocol === 'https:') {
        protocol = 'wss:';
      }
      this.socket = new window.ReconnectingWebSocket(`${protocol}//${host}`);
      this.socket.onmessage = this.props.messageReceived;
    }
  }

  componentDidUpdate() {
    if (this.props.shouldScrollToTop) {
      if (canUseDOM) {
        // defeat bootstrap menu close by using timeout
        setTimeout(() => {
          window.scrollTo(0, 0);
        });
      }
      this.props.scrolledToTop();
    }
  }

  componentWillUnmount() {
    this.removeAppCss();
    this.removeGlobalCss();
  }

  render() {
    return !this.props.error ? (
      <div>
        <HeaderContainer />
        {this.props.children}
        <FooterContainer />
        <NotificationListContainer />
        <ModalSectionContainer />
      </div>
    ) : this.props.children;
  }

}

export default App;
