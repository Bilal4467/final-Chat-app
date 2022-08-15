import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import Picker from 'emoji-picker-react';
import Navigation from "./Navigation"
import "./MessageForm.css";
function MessageForm() {
    const [message, setMessage] = useState("");
    const user = useSelector((state) => state.user);
    const { socket, currentRoom, setMessages, messages, privateMemberMsg } = useContext(AppContext);
    const messageEndRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);


    const onEmojiClick = (event, emojiObject) => {
        setMessage(prevInput => prevInput + emojiObject.emoji);
        setShowPicker(false);
    };
    //TO SCRLL THE MESSASGES TO THE BOTTOM
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    // date format
     //get the conversation new started time 
    function getFormattedDate() {
        const date = new Date();
        const year = date.getFullYear();
        let month = (1 + date.getMonth()).toString();

        month = month.length > 1 ? month : "0" + month;
        let day = date.getDate().toString();

        day = day.length > 1 ? day : "0" + day;

        return day + "/" + month + "/" + year;
    }

   

    function scrollToBottom() {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    //assigning fuction to the variable
    const todayDate = getFormattedDate();

    socket.off("room-messages").on("room-messages", (roomMessages) => {
        setMessages(roomMessages);
    });

    // function submit button
    function handleSubmit(e) {
        e.preventDefault();
        if (!message) return;
        //today date
        const today = new Date();
        const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
        const time = today.getHours() + ":" + minutes;
        const roomId = currentRoom;
        


        //sending messages & parametera to show
        socket.emit("message-room", roomId, message, user, time, todayDate);
        setMessage("");
    }
    return (
        <div className="mainChatBoxContainerParent">
            <div className="messages-output">
                {user && !privateMemberMsg?._id && <div className="alert alert-info"> <h3>You are in the {currentRoom} room </h3></div>}
                {user && privateMemberMsg?._id && (

                    <div className="alert alert-info width-100 conversation-info ">
                        <div className="flex">
                            <h3> {privateMemberMsg.name}<img src={privateMemberMsg.picture} className="conversation-profile-pic " /> </h3>
                        </div>
                    </div>

                )}
                {!user && <div className="alert alert-danger alert">Please login</div>}

                {user &&
                    //mapping the messages with the date and time along the sender profile img and name
                    messages.map(({ _id: date, messagesByDate }, idx) => (
                        <div key={idx} className=" main ">
                            <p className="alert alert-info text-center message-date-indicator ">{date}</p>
                            {messagesByDate?.map(({ content, time, from: sender }, msgIdx) => (
                                <div className={sender?.email == user?.email ? "message" : "incoming-message"} key={msgIdx}>
                                    <div className="message-inner">
                                        <div className="d-flex align-items-center ">
                                            <img src={sender.picture} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "50%", marginRight: 10 }} />
                                            <p className="message-sender">{sender._id == user?._id ? "You" : sender.name}</p>
                                        </div>
                                        <p className="message-content">{content}</p>
                                        <p className="message-timestamp-left">{time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                <div ref={messageEndRef} />
            </div>
            <div className="enter_message">
                {/* //message input form  */}
                <Form onSubmit={handleSubmit} className="for-position"  >
                    <Row>
                        <Col md={11} >
                            <Form.Group>
                                <div className="position-absolute bottom-100">

                                    {showPicker && <Picker pickerStyle={{ width: '50%' }} onEmojiClick={onEmojiClick} />}
                                    <img className="emoji-icon" src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                                        onClick={() => setShowPicker(val => !val)} />
                                </div>
                                {/* //enter message will be assign to the setMessage fuction as a pramiter */}
                                <Form.Control type="text" placeholder="Your message" disabled={!user} value={message} onChange={(e) => setMessage(e.target.value)}></Form.Control>



                            </Form.Group>
                        </Col>
                        <Col md={1}>
                            {/* //submit Button to to send the MESSASGES
                        //checking  if there is any useer then it wiil be done */}
                            <Button variant="primary" type="submit" style={{ width: "100%", backgroundColor: "orange"  }} disabled={!user}>
                                <i className="fas fa-paper-plane"></i>
                            </Button>
                        </Col>
                    </Row>
                </Form></div>

        </div>
    );
}

export default MessageForm;
