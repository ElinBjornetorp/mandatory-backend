
import React, { Component } from 'react';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      errorMessage: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  validateUsername(username) {
    let regex = /^[\w\- ]{1,12}$/;

    //Returning true if the username is ok, otherwise returning false
    return regex.test(username);
  }

  onChange(event) {
    //Updating state:username
    this.setState({input: event.target.value});
  }

  onSubmit(event) {
    //Preventing form being sent
    event.preventDefault();

    //Collecting input from user
    let input = this.state.input;

    console.log('input:');
    console.log(input);

    //Validating input (= the user name)
    let usernameIsOk = this.validateUsername(input);

    console.log('usernameIsOk:');
    console.log(usernameIsOk);

    //If the username is ok, call the log-in-function in the App component.
    // ...Otherwise, show an error message.
    if(usernameIsOk) {
      this.props.logIn(input);
      this.setState({errorMessage: false});
    }
    else {
      this.setState({errorMessage: true});
    }
  }

  render() {
    return (
      <form onSubmit={this.onSubmit} className="login-screen">
        <Input value={this.state.input} onChange={this.onChange} />
        <LoginButton/>
        <p>The username must be no longer than 12 characters. It can contain letters, digits, space and -.</p>
        {this.state.errorMessage ? <ErrorMessageUsername /> : null}
      </form>
    );
  }
}

class Input extends Component {
    render() {
      return <input value={this.props.value} onChange={this.props.onChange}/>;
    }
  }

class LoginButton extends Component {
    render() {
      return <button type="submit">Login</button>;
    }
  }

class ErrorMessageUsername extends Component {
  render() {
    return (
      <>
        <p>Oops! Did you really read the instructions?</p>
        <p>Try again!</p>
      </>
    );
  }
}
export default {
  LoginScreen: LoginScreen,
  Input: Input,
  LoginButton: LoginButton,
};
