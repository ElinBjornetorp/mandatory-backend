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
      userHistory: [],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onClickGoToRoom = this.onClickGoToRoom.bind(this);
    this.onChangeNewRoomInput = this.onChangeNewRoomInput.bind(this);
    this.onClickCreateNewRoom = this.onClickCreateNewRoom.bind(this);
    this.onClickDeleteRoom = this.onClickDeleteRoom.bind(this);
  }

  componentDidMount() {

    //Get a list of all rooms from the server
    this.getAllRooms();

    //Connecting to socket
    this.socket = io('http://localhost:3001');

    //Listening for new message
    this.socket.on('new_message', (message) => {

      //If the message belongs to the room where the user is...
      if(message.room === this.state.currentRoom) {
        // 1: Update state:messages
        let messages = this.state.messages.slice();
        messages.push(message);
        this.setState({messages:messages});

        // 2: Add user to userHistory, if not already included
        let newUsername = message.username;
        let userHistory = this.state.userHistory;
        let includedInUserHistory = false;
        for(let user of userHistory) {
          if(user === newUsername) {
            includedInUserHistory = true;
          }
        }
        if(includedInUserHistory === false) {
          let slicedUserHistory = this.state.userHistory.slice();
          slicedUserHistory.push(newUsername);
          this.setState({userHistory:slicedUserHistory});
        }
      }
    });
  }

  //Disconnecting socket when the user logs out
  componentWillUnmount() {
    this.socket.disconnect();
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

  getMessagesAndUserHistoryOfRoom(room) {
    axios.get('/messages/' + room)
      .then((response) => {
        this.setState({messages:response.data.messages});
        this.setState({userHistory:response.data.userHistory});
      })
      .catch((error) => {
        console.log(error);
      });
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
  }

  handleSubmit(username, content) {
    // << 1: Checking that the message is between 1 and 200 characters long >>
    let contentIsOk = content.length <= 200 && content.length > 0;

    // << 2: If ok, send message >>
    if(contentIsOk) {
      //Removing error message
      this.setState({errorMessage: false});

      //Sending message
      this.sendMessage(username, content);
    }
    else {
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

  onClickGoToRoom(event) {
    let room = event.target.id;
    this.getMessagesAndUserHistoryOfRoom(room);
    this.setState({currentRoom:room});
  }

  onChangeNewRoomInput(event) {
    let input = event.target.value;
    this.setState({newRoomInput:input});
  }

  onClickCreateNewRoom(event) {
    let roomName = this.state.newRoomInput;

    // Updating state:rooms
    let rooms = this.state.rooms.slice();
    rooms.push(roomName);
    this.setState({rooms:rooms});

    // Posting new room to server
    axios.post('/rooms', {
      roomName: roomName,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  onClickDeleteRoom(event) {
    let roomToDelete = event.target.id.split('-')[1];

    //Prevent bubbling
    event.stopPropagation();

    //Delete request
    axios.delete('/' + roomToDelete)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

    //Update state:rooms
    this.getAllRooms();
  }

  render() {
      let currentRoom = this.state.currentRoom;
      let userHistory = this.state.userHistory;

      let roomButtons = this.state.rooms.map(room => {
        return <RoomButton roomName={room} key={room} onClickGoToRoom={this.onClickGoToRoom} onClickDeleteRoom={this.onClickDeleteRoom}/>;
      });

      let activeUsers = userHistory.map( username => {
        return <span key={username}>{username}, </span>;
      });

      return (
        <ScrollToBottom>
        <div className="chat-screen">
          <header>
            <h1>EasyChat</h1>
            { currentRoom ? <h2>{currentRoom}</h2> : null }
            { currentRoom ? <p>Active users: {activeUsers}</p> : null }
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

// ------------------ Component: Room button ---------------------------
class RoomButton extends Component {
  render() {
    let iconId = 'delete-' + this.props.roomName;
    return(
      <button className="room-button" id={this.props.roomName} onClick={this.props.onClickGoToRoom}>
        {this.props.roomName}
        <i id={iconId} onClick={this.props.onClickDeleteRoom}>X</i>
      </button>
    );
  }
}

export default {
  ChatScreen: ChatScreen,
  MessageArea: MessageArea,
  Message: Message,
  MessageInput: MessageInput,
}
