import React, { useEffect, useState, useRef, useCallback } from "react"
import "./Chat.css"
import ChatBox from "./ChatBox"
import { ChannelType } from './Type'
import { MJoinChannel } from './Utils'
import { OpenError } from "./PopupRequest"
type Props = {
    toggleChat: () => void
}

function ChatHeader({ toggleChat }: Props) {
    return (
        <div className="ChatHeader" onClick={toggleChat}>
            <div className="ChatTitle">
                <img src="chat.png" className="ChatIcon" alt="chat.png" />
                Chat
            </div>
        </div>
    )
}

type PropsChannel = {
    setChatID: (arg0: boolean | number) => void
    channel: ChannelType;
    index: number;
    meFriends: any;
    userID: number;
    setChannelJoinPWD: (arg0: number) => void;
}

const channelType: {[key: number]: string} = {
    1: "Public",
    2: "Privé",
    3: "Protégé",
    4: "DM"
}

function ChatChannel({ setChatID, channel, index, meFriends, userID, setChannelJoinPWD }: PropsChannel) {
    let name = channel.name;
    if (channel.type === 4) {
        const keys = Object.keys(channel.users);
        const firstID = keys[1];
        const secondID = keys[2];

        let friendID: string = "";
        if (firstID === userID.toString()) {
            friendID = secondID;
        } else {
            friendID = firstID;
        }

        /*Invalide ?*/
        if (friendID === "" || !friendID || !meFriends[friendID]) {
            name = "Inconnu";
        } else {
            name = meFriends[friendID].nick;
        }
    }

    const color = channel.users[userID] ? "var(--color-text)" : "#777775";
    return (
        <div className="ChatChannel" style={{color: color}} data-contextmenutype={"channel"} data-contextmenucontent={JSON.stringify(channel)} onClick={() => {
            if (channel.type === 1 && !channel.users[userID]) {
                MJoinChannel(channel.id);
                return
            } else if (channel.type === 3 && !channel.users[userID]) {
                setChannelJoinPWD(channel.id);
            }
            setChatID(index);
        }}>
            # {name}
        </div>
    )
}

function ChatChannelType({ type, createChannel, channels, setChatID, meFriends, userID, setChannelJoinPWD }: {type: number, createChannel: (type: number) => void, channels: {[id: number]: ChannelType}, setChatID: (arg0: boolean | number) => void, meFriends: any, userID: number, setChannelJoinPWD: (arg0: number) => void}) {
    const refContainer = useRef<HTMLDivElement>(null);
    const refButton = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(true);
    function ToggleContainer(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!refContainer.current) { return }
        if (!refButton.current) { return }
        if (event.target !== refButton.current) { return }
        if (isOpen) {
            refContainer.current.style.height = "30px";
            refContainer.current.style.overflow = "hidden";
        } else {
            refContainer.current.style.height = "max-content";
            refContainer.current.style.overflow = "visible";
        }
        setIsOpen((isOpen) => !isOpen);
    }
    return (
        <div ref={refContainer} className="ChatChannelTypeContainer">
            <div ref={refButton} className="ChatChannelType" onClick={ToggleContainer}>
                {"[" + channelType[type] + "]"}
                <div className="ChatChannelLine"></div>
                {type !== 4 && <div className="ChatChannelAdd" onClick={() => createChannel(type)}>+</div>}
            </div>
            {Object.keys(channels).map((index) => {
                const newIndex = parseInt(index);
                const channel = channels[newIndex];
                if (type === channel.type) {
                    return (
                        <ChatChannel key={channel.id} setChatID={setChatID} channel={channel} index={newIndex} meFriends={meFriends} userID={userID} setChannelJoinPWD={setChannelJoinPWD} />
                    )
                }
                return null;
            })}
        </div>
    )
}

type ChatProps = {
    chatNeedRefresh: boolean;
    setChatNeedRefresh: (arg0: boolean) => void;
    userID: number;
    createChannel: (type: number) => void;
    chatID: number | boolean;
    setChatID: (arg0: number | boolean) => void;
    meFriends: any;
    messages: any;
    setMessages: (arg0: any) => void;
    chatOpen: boolean;
    setChatOpen: (arg0: boolean | ((arg: boolean) => boolean)) => void;
    channels: {[key: number]: ChannelType};
    setChannels: (arg0: {[key: number]: ChannelType}) => void;
    meBlocked: {[key: number]: boolean};
    setChannelInvite: (arg0: boolean | number) => void;
    setChannelJoinPWD: (arg0: boolean | number) => void;
}

function Chat({ chatNeedRefresh, setChatNeedRefresh, userID, createChannel, chatID, setChatID, meFriends, messages, setMessages, chatOpen, setChatOpen, channels, setChannels, meBlocked, setChannelInvite, setChannelJoinPWD }: ChatProps) {

    const refChat = useRef<HTMLDivElement>(null);
    const toggleChat = useCallback(() => {
        if (!refChat.current) { return }
        if (chatOpen) {
            refChat.current.style.transform = "translateY(-20px)";
        } else {
            refChat.current.style.transform = "translateY(calc(100% - 70px))";
        }
    }, [chatOpen])

    useEffect(() => {
        toggleChat();
        if (!chatNeedRefresh) { return }
        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/user/" + userID, {
            method: "GET",
            credentials: "include",
        }).then((res) => {
            res.json().then((data) => {
                if (res.ok) {
                    setChannels(data.channels || []);
                    setChatNeedRefresh(false);
                    if (chatID && !data.channels[chatID as number]) {
                        setChatID(false);
                    }
                } else
                    OpenError(data.message)
            });
        })
    }, [userID, chatNeedRefresh, setChatNeedRefresh, meFriends, chatOpen, setChannels, setChatID, chatID, toggleChat]);
    
    return (
        <div className="Chat" ref={refChat}>
            <ChatHeader toggleChat={() => setChatOpen((isOpen: boolean) => !isOpen)} />

            <div className="ChatBody">
                {((typeof chatID === "boolean" ||  !channels[chatID] || !channels[chatID].users[userID]) && (
                    <div className="ChatContainer">
                        <div className="ChatChannel" onClick={() => setChannelInvite(true)}>
                            - Utiliser une invitation
                        </div>
                        {(() => {
                        let type = 0;
                        const returnResult = [1, 2, 3, 4].map((typeChannel) => {
                            if (type !== typeChannel) {
                                type = typeChannel;
                                return (
                                    <ChatChannelType key={type} createChannel={createChannel} setChatID={setChatID} type={type} channels={channels} meFriends={meFriends} userID={userID} setChannelJoinPWD={setChannelJoinPWD} />
                                )
                            }
                            return null;
                        })
                        return returnResult;
                    })()}
                    </div>
                )) || ((typeof chatID === "number" && channels[chatID]) && (
                        <ChatBox returnChat={setChatID} channel={channels[chatID]} messages={messages} setMessages={setMessages} meFriends={meFriends} userID={userID} meBlocked={meBlocked} />
                    )
                )}
            </div>
        </div>
    )
}

export default Chat