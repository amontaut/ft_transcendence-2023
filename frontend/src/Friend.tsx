import React, { useEffect } from "react";
import "./Friend.css";
import TitleContainers from "./TitleContainers";
import { MRemoveFriend, MAcceptFriend, MBlockUser, MSpectateGame } from "./Utils";

const Status = {
    0: "Hors ligne",
    1: "En ligne",
    2: "Absent",
    3: "Occupé",
    4: "En jeu",
    5: "Spectateur",
    6: "En file d'attente",
} as any

function FriendDetail({ userID, id, pending, invite, nick, status, channel, setChatID, setChatOpen, setGameStatus }: { userID: number, id: number, pending: boolean | null, invite: number, nick: string, status: number, channel: number, setChatID: (arg: number | boolean) => void, setChatOpen: (arg: boolean) => void, setGameStatus: (arg: number) => void}) {
    useEffect(() => {

    }, [id]);

    const invited = pending && invite !== userID;
    const notInvited = !pending

    return (
        <div className="FriendDetail">
            <div className="FriendIcon">
                <img src={(process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/avatar/" + id + ".png?useless=ImageFriend" + id + (Date.now()/1000)} className="FriendIconImage" alt="logo" />
                <div className="HoverBulle FriendStatus" data-status={status}>
                </div>
            </div>
            <div className="FriendInfo">
                <div className="FriendName">
                    {nick}
                </div>
                <div className="FriendStatusText">
                    {(invited && "Demande d'ami reçue") || (notInvited && Status[status]) || "Demande d'ami envoyée"}
                </div>
            </div>
            {
                ((invited && (
                    <div className="FriendActionContainer">
                        <div data-hover="Accepter" className="FriendAction Green" onClick={() => {
                            MAcceptFriend(id, () => { });
                        }}>
                            <img src="./check.png" className="FriendActionIcon" alt="message.png" />
                        </div>

                        <div data-hover="Supprimer" className="FriendAction Red" onClick={() => {
                            MRemoveFriend(id, () => { });
                        }}>
                            <img src="./cross.png" className="FriendActionIcon" alt="eye.png" />
                        </div>
                    </div>
                )) || (notInvited && (
                    <div className="FriendActionContainer">
                        <div data-hover="Envoyer un message" className="FriendAction" onClick={() => {
                            setChatOpen(true);
                            setChatID(channel);
                        }}>
                            <img src="./message.png" className="FriendActionIcon" alt="message.png" />
                        </div>

                        <div data-hover="Spectate" className="FriendAction" onClick={() => {
                            MSpectateGame(id, () => setGameStatus(2));
                        }}>
                            <img src="./eye.png" className="FriendActionIcon" alt="eye.png" />
                        </div>

                        <div data-hover="Supprimer" className="FriendAction" onClick={() => {
                            MRemoveFriend(id, () => { });
                        }}>
                            <img src="./friend.png" className="FriendActionIcon" alt="friend.png" />
                        </div>

                        <div data-hover="Bloquer" className="FriendAction" onClick={() => {
                            MBlockUser(id, () => { })
                        }}>
                            <img src="./block.png" className="FriendActionIcon" alt="block.png" />
                        </div>
                    </div>
                )) || (
                        <div className="FriendActionContainer">
                            <div data-hover="Supprimer" className="FriendAction Red" onClick={() => {
                                MRemoveFriend(id, () => { });
                            }}>
                                <img src="./cross.png" className="FriendActionIcon" alt="cross.png" />
                            </div>
                        </div>
                    ))
            }
        </div>
    )
}

function Friend({ setFriendPopup, meFriends, userID, setChatID, setChatOpen, setGameStatus }: { userID: number, setFriendPopup: (value: boolean) => void, meFriends: any, chatID: number | boolean, setChatID: (arg: number | boolean) => void, setChatOpen: (arg: boolean) => void, setGameStatus: (arg: number) => void }) {
    useEffect(() => {

    }, [meFriends])
    
    return (
        <div className="Friend">
            <div className="FriendHeader">
                <TitleContainers title="Amis" />
                <div className="FriendAction FriendAdd" onClick={() => setFriendPopup(true)}>
                    +
                </div>
            </div>
            <div className="FriendContainers">
                {
                    Object.keys(meFriends).map((key) => {
                        const friend = meFriends[key];
                        return (
                            <FriendDetail setGameStatus={setGameStatus} key={friend.id + "Friends"} id={friend.id} pending={friend.pending} invite={friend.invite} channel={friend.channel} nick={friend.nick} status={friend.status} userID={userID} setChatID={setChatID} setChatOpen={setChatOpen} />
                        )
                    })
                }
            </div>

            {/*addFriend && <PopupRequest onConfirm={() => setAddFriend(false)} onRemove={() => setAddFriend(false)} canRemove={() => true} placeholder="Entrez un pseudo" title="Demande d'ami" />*/}
        </div>
    )
}

export default Friend