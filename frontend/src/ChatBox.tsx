import React, {useCallback, useEffect, useRef, useState} from "react";
import "./ChatBox.css";
import RetreiveSocket from "./Socket";
import { OpenError } from "./PopupRequest";
import { Message } from "./Type";
const socket = RetreiveSocket();

export function FormatDate(ndate: string) {
    const date = new Date(parseInt(ndate));
    const actualDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const hours  = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let formatDate = hours + ":" + minutes;
    if (date.getDay() === actualDate.getDay() && date.getMonth() === actualDate.getMonth() && date.getFullYear() === actualDate.getFullYear()) {
        formatDate = "Aujourd'hui à " + formatDate;
    } else if (date.getDay() === yesterdayDate.getDay() && date.getMonth() === yesterdayDate.getMonth() && date.getFullYear() === yesterdayDate.getFullYear()) {
        formatDate = "Hier à " + formatDate;
    } else {
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        formatDate = day + "/" + month + "/" + date.getFullYear() + " à " + formatDate;
    }
    return formatDate;
}

function ChatBoxMessage({message, owner, admin, mute, ban, meBlocked, inChannel, userID}: {message: Message, owner: boolean, admin: boolean, mute: boolean, ban: boolean, meBlocked: {[id: number]: boolean}, inChannel: boolean, userID: number}) {
    const formatDate = FormatDate(message.date);
    
    useEffect(() => {

    }, [message]);
    return (
        <div className="Message">
            <div className="MessageIconContainer">
                <div className="MessageIcon">
                    <img src={(process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/avatar/" + message.author + ".png?useless=ImageChat" + message.id + (Date.now()/1000)} alt="logo" />
                </div>
            </div>
            <div>
                <div className="MessageInfo">
                    <div className="MessageNick" data-contextmenutype={"user"} data-contextmenucontent={JSON.stringify({id: message.author, nick: message.nick, targetChannel: message.channel})} style={{color: (!inChannel && "grey") || (message.author === userID && "#EC2222") || "#22EC8B"}}>
                        {message.nick}
                    </div>
                    <div className="MessageIconRoleContainer">
                        {owner && <img src="./owner.png" className="MessageIconRole" alt="owner" />}
                        {admin && <img src="./admin.png" className="MessageIconRole" alt="admin" />}
                        {ban && <img src="./ban.png" className="MessageIconRole" alt="ban" />}
                        {mute && <img src="./mute.png" className="MessageIconRole" alt="mute" />}
                    </div>
                    <div className="MessageDate">
                        {formatDate}
                    </div>
                </div>
                <div className="MessageContent">
                    {(meBlocked[message.author] && (<div className="MessageBlocked">Message bloqué</div>)) || message.content}
                </div>
            </div>
        </div>
    )
}

type ChannelType = {
    id: number;
    name: string;
    type: number;
    owner: number;
    users: {[id: number]: {owner: boolean, mute: number, ban: number, admin: boolean}};
    password: string;
}

type ChatBoxProps = {
    returnChat: (arg0: boolean) => void,
    channel: ChannelType,
    messages: Message[],
    setMessages: (arg0: Message[]) => void,
    meFriends: any, userID: number,
    OnEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    endMessage: React.RefObject<HTMLDivElement>,
    setScrollDiff: (arg0: number) => void,
    FetchMessage: (arg0: number) => void,
    meBlocked: {[id: number]: boolean}
}

function ChatBoxStandard({ returnChat, channel, messages, setMessages, userID, meFriends, OnEnter, endMessage, setScrollDiff, FetchMessage, meBlocked}: ChatBoxProps) {
    useEffect(() => {
        if (!channel || !channel.users[userID]) {
            returnChat(false);
            return;
        }
    }, [channel, userID, returnChat]);

    if (!channel || !channel.users[userID]) {
        return <div></div>;
    }

    const isBan = channel.users[userID].ban > (Date.now() / 1000)
    const tsx = (
        <div className="MessageContainer" onScroll={(e) => {
            const messageContainer = e.currentTarget as HTMLDivElement;
            setScrollDiff(messageContainer.scrollHeight - messageContainer.clientHeight - messageContainer.scrollTop - 1);
            if (messageContainer.scrollTop === 0) {
                if (!messages[0] || !messages[messages.length - 1] || (messages[0].id === messages[messages.length - 1].id))
                    return;
                FetchMessage(messages[messages.length - 1].id - messages[0].id);
            }
        }}>
            {messages.map((message: Message) => {
                const MUser = channel.users[message.author] || {owner: false, mute: 0, ban: 0, admin: false};
                return (
                    <ChatBoxMessage key={message.id} message={message} owner={MUser.owner} admin={MUser.admin} ban={MUser.ban > (Date.now()/1000)} mute={MUser.mute > (Date.now()/1000)} meBlocked={meBlocked} inChannel={(channel.users[message.author] && true) || false} userID={userID} />
                )
            })}
            <div ref={endMessage} />
        </div>
    )

    return (
        <div className="ChatBox">
            <div className="ChatBoxHeader">
                <div className="ChatBoxReturn" onClick={() => returnChat(false)}>
                    &lt;
                </div>
                <div className="ChatBoxDecorator">
                    #
                </div>
                <div className="ChatBoxTitle">
                    {channel.name}
                </div>
            </div>

            {(isBan &&
                <div className="ChatBan">
                    {tsx}
                </div>) || tsx}

            {(((channel.users[userID].mute > Date.now()/1000) || isBan) && (
                <input className="ChatBoxInput" placeholder="Tu ne peux pas écrire ..." style={{cursor: "not-allowed"}} onKeyDown={(e) => e.preventDefault()} />
            )) || (
                <input className="ChatBoxInput" placeholder="Ecrivez un message ..." onKeyDown={OnEnter} />
            )}
        </div>
    )

}

function ChatBoxDM({ returnChat, channel, messages, setMessages, userID, meFriends, OnEnter, endMessage, setScrollDiff, FetchMessage, meBlocked}: ChatBoxProps) {
    let friendID: string = "";
    const keys = Object.keys(channel.users);
    const firstID = keys[1];
    const secondID = keys[2];
    if (firstID === userID.toString()) {
        friendID = secondID;
    } else {
        friendID = firstID;
    }

    useEffect(() => {
        if (friendID === "" || !friendID || !meFriends[friendID]) {
            returnChat(false);
        }
    });

    if (friendID === "" || !friendID || !meFriends[friendID]) {
        return <div></div>;
    }

    return (
        <div className="ChatBox">
            <div className="ChatBoxHeader">
                <div className="ChatBoxReturn" onClick={() => returnChat(false)}>
                    &lt;
                </div>
                <div className="ChatBoxDecorator">
                    @
                </div>
                <div className="ChatBoxTitle">
                    {meFriends[friendID].nick}
                </div>
                <div className="ChatBoxStatus" data-status={meFriends[friendID].status}>
                    
                </div>
            </div>

            <div className="MessageContainer" onScroll={(e) => {
                    const messageContainer = e.currentTarget as HTMLDivElement;
                    setScrollDiff(messageContainer.scrollHeight - messageContainer.clientHeight - messageContainer.scrollTop - 1);
                    if (messageContainer.scrollTop === 0) {
                        if (!messages[0] || !messages[messages.length - 1] || (messages[0].id === messages[messages.length - 1].id))
                            return;
                        FetchMessage(messages[messages.length - 1].id - messages[0].id);
                    }
                }}>
                {messages.map((message: Message) => {
                    return (
                        <ChatBoxMessage key={message.id + "ChatBox" + channel.id} message={message} admin={false} owner={false} mute={false} ban={false} meBlocked={meBlocked} inChannel={(channel.users[message.author] && true) || false} userID={userID} />
                    )
                })}
                <div ref={endMessage} />
            </div>
            {((channel.users[userID].mute > Date.now()/1000) && (
                <input className="ChatBoxInput" placeholder="Tu es mute ..." style={{cursor: "block"}} />
            )) || (
                <input className="ChatBoxInput" placeholder="Ecrivez un message ..." onKeyDown={OnEnter} />
            )}
        </div>
    )
}

function ChatBox({ returnChat, channel, messages, setMessages, userID, meFriends, meBlocked }: {returnChat: (arg0: boolean) => void, channel: ChannelType, messages: {[id: number]: Message[]}, setMessages: (arg0: Message[]) => void, meFriends: any, userID: number, meBlocked: {[id: number]: boolean}}) {
    const endMessage = useRef<HTMLDivElement>(null);
    const [fetchMessages, setFetchMessages] = useState(false);
    const [scrollDiff, setScrollDiff] = useState(0);
    const [oldScroll, setOldScroll] = useState(0);
    function OnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            setScrollDiff(0)
            if (endMessage.current) {
                endMessage.current.scrollIntoView();
            }
            socket.emit("nets", {
                net: "NewMessage",
                args: {
                    channel: channel.id,
                    message: e.currentTarget.value
                }
            })
            e.currentTarget.value = "";
        }
    }

    const FetchMessage = useCallback((min: number) => {
        if (min < 0) {
            return;
        }
        if (endMessage.current) {
            const messageContainer = endMessage.current.parentNode as HTMLDivElement;
            setOldScroll(messageContainer.scrollHeight);
        }
        fetch(`${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/message/fetch/${channel.id}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                min: min
            })
        }).then((res) => {
            res.json().then((data) => {
                if (res.ok) {
                    let newMessages = {} as any;
                    for (const key of Object.keys(messages)) {
                        newMessages[key] = messages[key as any];
                    }
                    newMessages[channel.id] = newMessages[channel.id] || []
                    for (const message of data.messages) {
                        if (newMessages[channel.id].find((m: Message) => m.id === message.id)) {
                            continue;
                        }
                        newMessages[channel.id].unshift(message);
                    }
                    setMessages(newMessages);
                } else
                    OpenError(data.message)
            });
        })
    }, [channel, messages, setMessages]);

    useEffect(() => {
        if (endMessage.current) {
            if (scrollDiff <= 0) {
                endMessage.current.scrollIntoView();
                setOldScroll(0);
            } else if (oldScroll !== 0) {
                setTimeout(() => {
                    const messageContainer = endMessage?.current?.parentNode as HTMLDivElement;
                    messageContainer.scrollTop = messageContainer.scrollHeight - oldScroll;
                    setOldScroll(0);
                }, 40)
            }
        }
    
        if (fetchMessages) { return; }
        setFetchMessages(true);
        FetchMessage(0)
    }, [messages, FetchMessage, scrollDiff, oldScroll, endMessage, fetchMessages])

    messages[channel.id] = messages[channel.id] || [];
    
    if (channel.type === 4) {
        return (
            <div>
                <ChatBoxDM returnChat={returnChat} channel={channel} messages={messages[channel.id]} setMessages={setMessages} userID={userID} meFriends={meFriends} OnEnter={OnEnter} endMessage={endMessage} setScrollDiff={setScrollDiff} FetchMessage={FetchMessage} meBlocked={meBlocked} />
            </div>
        )
    } else {
        return (
            <div>
                <ChatBoxStandard returnChat={returnChat} channel={channel} messages={messages[channel.id]} setMessages={setMessages} userID={userID} meFriends={meFriends} OnEnter={OnEnter} endMessage={endMessage} setScrollDiff={setScrollDiff} FetchMessage={FetchMessage} meBlocked={meBlocked} />
            </div>
        )
    }
}

export default ChatBox;