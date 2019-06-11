import React, { Component } from 'react';
import io from 'socket.io-client';
import Emojify from 'react-emojione'; //Emojify is a component
import ScrollToBottom from "react-scroll-to-bottom";
import axios from 'axios';

// ------------------ Component: Chat screen ---------------------------
class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      errorMessage: false,
      rooms: [],
      currentRoom: '',
      newRoomInput: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onClickGoToRoom = this.onClickGoToRoom.bind(this);
    this.onChangeNewRoomInput = this.onChangeNewRoomInput.bind(this);
    this.onClickCreateNewRoom = this.onClickCreateNewRoom.bind(this);
  }

  getAllRooms() {
    axios.get('/rooms')
      .then((response) => {
        let rooms = response.data;
        this.setState({rooms:rooms});
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {

    this.getAllRooms();

    //Connecting to socket
    //this.socket = io('http://localhost:3001');

    //Showing a message 'connected' in the log when socket is connected
    // this.socket.on('connect', function(){
    //   console.log('connected');
    // });

    //All messages received from socket will be put in state:messages
    //Using big arrow to bind 'this'. 'This' will be the same as outside the function.
    // this.socket.on('messages', (messages) => {
    //   this.setState({messages: messages});
    // });

    //Updating state:messages when a new message arrives
    // this.socket.on('new_message', (message) => {
    //   //Showing a message in the console
    //   console.log('A new message arrived');
    //   console.log(message);
    //
    //   //Updating state:messages
    //   let messages = this.state.messages.slice();
    //   messages.push(message);
    //   this.setState({messages:messages});
    // });
  }

  //Disconnecting socket when the user logs out
  componentWillUnmount() {
    //this.socket.disconnect();
  }

  sendMessage(username, content) {
    let currentRoom = this.state.currentRoom;

    axios.post('/messages/' + currentRoom, {
      username: username,
      content: content
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

    // this.socket.emit('chat message', {
    //   username: username,
    //   content: content,
    //   socket_id: this.socket.id,
    // });
  }

  handleSubmit(username, content) {
    // << 1: Checking that the message is between 1 and 200 characters long >>
    let contentIsOk = content.length <= 200 && content.length > 0;

    // << 2: If ok, send message and update state:messages >>
    if(contentIsOk) {

      console.log('This message is ok.');

      //Removing error message
      this.setState({errorMessage: false});

      //Sending message
      this.sendMessage(username, content);

      //Finding out the nr of the latest message
      let messagesLength = this.state.messages.length;
      let latestMessageNr;
      if(messagesLength === 0) {
        latestMessageNr = 0;
      }
      else {
        let latestMessageId = this.state.messages[messagesLength - 1].id;
        latestMessageNr = parseFloat(latestMessageId.split('-')[1]);
      }

      //Creating an object out of the new message
      let newMessage = {
        username: username,
        content: content,
        id: 'message-' + (latestMessageNr + 1),
      };

      //Adding the new object to state:messages
      let messages = this.state.messages.slice();
      messages.push(newMessage);
      this.setState({messages:messages});
    }
    else {
      console.log('This message is not ok.');
      this.setState({errorMessage: true});
    }

  }

  convertToLinks(string) {

    //Splitting string
    let words = string.split(" ");

    //Creating regex:s
    let regex1 = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    let regex2 = /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

    //Looping through the array with 'map'
    //Returning a link component if the word is a link
    const convertedArray = words.map((word) => { // <-- convertedArray will contain strings and link-components
      if(regex1.test(word)) {
        return <Link url={word}/>; //This will replace the string with a link component
      }
      else if(regex2.test(word)) {
        return <LinkWithHttpAdded url={word}/>; //This will replace the string with a link component
      }

      return word;
    });

    let newArray = convertedArray.map((word) => {
      return [word, " "];
    });

    return newArray;
  }

  // onClickGoToSecretRoom(event) {
  //   console.log('Going to secret room.');
  //   this.socket.emit('join', 'secret');
  //
  //   //All messages received from socket will be put in state:messages
  //   //Using big arrow to bind 'this'. 'This' will be the same as outside the function.
  //   this.socket.on('messages', (messages) => {
  //     this.setState({messages: messages});
  //   });
  // }

  // onClickGoToGeneralRoom(event) {
  //   console.log('Going to general room.');
  //   this.socket.emit('join', 'general');
  //
  //   //All messages received from socket will be put in state:messages
  //   //Using big arrow to bind 'this'. 'This' will be the same as outside the function.
  //   this.socket.on('messages', (messages) => {
  //     this.setState({messages: messages});
  //   });
  // }

  onClickGoToRoom(event) {
    let room = event.target.textContent;

    // Get all messages in a room
    axios.get('/messages/' + room)
      .then((response) => {
        // handle success
        let messages = response.data;
        this.setState({messages:messages});
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });

    this.setState({currentRoom:room});
  }

  onChangeNewRoomInput(event) {
    let input = event.target.value;
    this.setState({newRoomInput:input});
  }

  onClickCreateNewRoom(event) {
    let roomName = this.state.newRoomInput;
    axios.post('/rooms', {
      roomName: roomName,
    })
    .then((response) => {
      console.log(response);
      this.getAllRooms();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  render() {
      let currentRoom = this.state.currentRoom;

      let roomButtons = this.state.rooms.map(room => {
        return <RoomButton roomName={room} key={room} onClickGoToRoom={this.onClickGoToRoom}/>;
      });

      return (
        <ScrollToBottom>
        <div className="chat-screen">
          <header>
            <h1>EasyChat</h1>
            { currentRoom ? <h2>{currentRoom}</h2> : null }
            <div className="log-out-div">
              <p className="whoIsLoggedIn-paragraph">{this.props.username} is logged in.</p>
              <button className="log-out-button" onClick={this.props.onClick}>Log out</button>
              {roomButtons}
              <input type="text" onChange={this.onChangeNewRoomInput}/>
              <button onClick={this.onClickCreateNewRoom}>Create new room</button>
            </div>
          </header>
          <main>
            <MessageArea messages={this.state.messages} convertToLinks={this.convertToLinks}/>
            <MessageInput onSubmit={this.handleSubmit} username={this.props.username}/>
            {this.state.errorMessage ? <ErrorMessageForChatScreen /> : null}
          </main>
        </div>
        </ScrollToBottom>
      );
  }
}

// ------------------ Component: Message area ---------------------------
class MessageArea extends Component {
  render() {
    let messages = this.props.messages;
    let messageComponent;

    //Creating an array to hold the Message components
    let messageComponents = [];

    //Filling the array with Message components
    for(let message of messages) {
      messageComponent = <Message username={message.username} content={message.content} key={message.id} convertToLinks={this.props.convertToLinks}/>;
      messageComponents.push(messageComponent);
    }

    return(
      <div className="message-area">
      {messageComponents}
      </div>
    );
  }
}

// ------------------ Component: Message ---------------------------
class Message extends Component {
  render() {
    //Converting links
    let convertedContent = this.props.convertToLinks(this.props.content);

    return(
      <div className="message">
        <p className="message__username">{this.props.username}</p>
        <Emojify className="message__content">{convertedContent}</Emojify>
      </div>
    );
  }
}

// ------------------ Component: Message input ---------------------------
//             << Includes a textarea and a button >>
class MessageInput extends Component {
  onSubmit = (e) => {
      //Preventing form being sent
      e.preventDefault();

      //Finding the textarea, from where I want to collect the input
      let form = e.target;
      let textarea = form.querySelector('textarea');

      //Making variables for username and content
      let username = this.props.username;
      let content = textarea.value;

      this.props.onSubmit(username, content);
    }

  render() {
    return(
      <form className="message-input" onSubmit={this.onSubmit}>
        <textarea className="message-input__textarea" rows="4" cols="50"></textarea> <br/>
        <button className="message-input__button" type="submit">Send</button>
      </form>
    );
  }
}

// ------------------ Component: Error message (chat screen) ---------------------------
class ErrorMessageForChatScreen extends Component {
  render() {
    return (
      <p className="message-input__errormessage">Maximum length is 200 characters, minimum 1 character. Try again!</p>
    );
  }
}

// ------------------ Component: Link ---------------------------
class Link extends Component {
  render() {
    return <a href={this.props.url}>{this.props.url}</a>;
  }
}

// ------------------ Component: Link with http added  ---------------------------
//                     << Adds http protocol to url >>
class LinkWithHttpAdded extends Component {
  render() {
    return <a href={'http://'+this.props.url}>{this.props.url}</a>;
  }
}

// ------------------ Component: RoomButton ---------------------------
class RoomButton extends Component {
  render() {
    return <button className="room-button" onClick={this.props.onClickGoToRoom}>{this.props.roomName}</button>;
  }
}

export default {
  ChatScreen: ChatScreen,
  MessageArea: MessageArea,
  Message: Message,
  MessageInput: MessageInput,
}
