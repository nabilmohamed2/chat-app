import React, { use, useEffect, useState } from 'react';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;

const Chat = () => {
    const location = useLocation();
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ENDPOINT = 'https://chat-app-zq6h.onrender.com';

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        socket = io(ENDPOINT); // Connect to the server

        setName(name);
        setRoom(room);

        console.log(socket);

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                alert(error);
            }
        });
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('message', (message) => {
            console.log('final');
            setMessages(messages => [...messages, message]);
            console.log(messages);
        });
    }, []);

    const sendMessage = (event) => {
        event.preventDefault();
        
        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    console.log(messages, message);

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name}/>
                <Input setMessage={setMessage} sendMessage={sendMessage} message={message}/>
            </div>
        </div>
    );
};

export default Chat;
