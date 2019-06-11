import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginScreen from './LoginScreen.js';
import ChatScreen from './ChatScreen.js';

//Socket
import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      username: undefined,
    };
    this.onClickLogOut = this.onClickLogOut.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  logIn(username) {
    this.setState({username: username});
    this.setState({isLoggedIn: true});
  }

  onClickLogOut(event) {
    this.setState({isLoggedIn: false});
  }

  render() {
    let page = <LoginScreen.LoginScreen logIn={this.logIn}/>;

    if (this.state.isLoggedIn) {
      page = <ChatScreen.ChatScreen username={this.state.username} onClick={this.onClickLogOut}/>;
    }

    return (
      <div className="App">
        {page}
      </div>
    );
  }
}

export default App;
