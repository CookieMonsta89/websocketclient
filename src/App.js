import React, { Component } from "react";

import "./App.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";

import { Card, Avatar, Input, Typography } from "antd";

import "antd/dist/antd.css";

import logo from "./logo-iel.png";

import semigif from "./semigif.gif";

const { Search } = Input;

const { Text } = Typography;

const { Meta } = Card;

const client = new W3CWebSocket("wss://joewebsocketserver.herokuapp.com");
// const client = new W3CWebSocket("ws://localhost:8000");

export default class App extends Component {
	state = {
		userName: "",

		isLoggedIn: false,

		messages: [],

    searchVal: "",
    
    whoIsTyping: 'null'
	};

	componentDidMount() {
		client.onopen = () => {
			console.log("Websocket connected");
		};

		client.onmessage = (message) => {
      let dataFromServer = null;
      if (message.data.includes('typing') || message.data.includes('null')) {
        dataFromServer = message.data
        this.setState({
          whoIsTyping: dataFromServer
        })
        console.log(this.state.whoIsTyping, 'state')
      } else {
        dataFromServer = JSON.parse(message.data);
        if (dataFromServer.type === "message") {
          this.setState((state) => ({
            messages: [
              ...state.messages,
              {
                msg: dataFromServer.msg,
                user: dataFromServer.user,
              },
            ],
            whoIsTyping: 'null',
          }));
          document.getElementById('scroll').scrollIntoView();
          console.log(this.state.whoIsTyping, 'second typing')
        }
      }
		};
  }

	onButtonClicked = (value) => {
		client.send(
			JSON.stringify({
				type: "message",

				msg: value,

				user: this.state.userName,
			})
		);

		this.setState({ searchVal: "" });
  };
  
  onChangeType = (e) => {
    this.setState({ searchVal: e.target.value })
    if (this.state.searchVal.length > 0) {
      client.send(`${this.state.userName} is typing...`)
    } else {
      client.send('null')
    }
  }

  whoIsTypingFunc = () => {
    if (this.state.whoIsTyping !== 'null' && !this.state.whoIsTyping.includes(this.state.userName)) {
      return (
        <div className={this.state.messages.length > 0 && this.state.messages[this.state.messages.length - 1].user === this.state.userName ? "whoistyping-left" : "whoistyping-right"} style={{color:"white"}}>
          <p>{this.state.whoIsTyping}</p>
        </div>
      )
    }
  }

	render() {
		return (
      <div className="main">
				{this.state.isLoggedIn ? (
					<div>
						<div className="title">
            <img src={logo} alt="logo"/>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								paddingBottom: 50,
							}}
						>
							{this.state.messages.map((message) => (
								<Card
									key={message.msg}
									style={{
										width: 300,
										margin: "16px 4px 0 4px",
										alignSelf:
											this.state.userName === message.user
												? "flex-end"
												: "flex-start",
									}}
								>
									<Meta
										avatar={
											<Avatar
												style={{ color: "white", backgroundColor: "#f58220" }}
											>
												{message.user[0].toUpperCase()}
											</Avatar>
										}
										title={message.user}
										description={message.msg}
									/>
								</Card>
							))}
						</div>

            <div className="bottom">
                {this.whoIsTypingFunc()}
							<Search
								placeholder="input message and send"
								enterButton="Send"
								value={this.state.searchVal}
								size="large"
								onChange={this.onChangeType}
                onSearch={(value) => this.onButtonClicked(value)}
							/>
            </div>
            <div id="scroll" />
					</div>
				) : (
          <div style={{ padding: "200px 40px", display:"flex", flexDirection:"column", alignItems:"center", height:"100vh", justifyContent:"space-evenly" }}>
            <div className="image-container">
              <img src={logo} alt="logo" />
            </div>
            <Text type="secondary" style={{ fontSize: "36px", color: "white"}}>
							Enter a Username:
						</Text>
						<Search
							placeholder="Enter Username"
							enterButton="Login"
							size="large"
							onSearch={(value) =>
								this.setState({ isLoggedIn: true, userName: value })
							}
						/>
					</div>
				)}
			</div>
		);
	}
}
