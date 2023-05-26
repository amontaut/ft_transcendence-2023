import React, { useRef, useEffect, useState } from "react";
import "./ContextMenu.css"
import { MAddFriend, MRemoveFriend, MRemovePWD, MBlockUser, MJoinChannel, MSpectateGame } from "./Utils";
import { ChannelType } from './Type'
import { OpenError } from "./PopupRequest";

type ContextInfo = {
    type: string;
    content: ChannelType;
}

type ContextMenuActionType = {
    [key: string]: (content: any) => {
        text: string,
        action: () => void,
        can?: () => boolean
    }[]
}

type User = {
    id: number,
    nick: string,
    status: number,
    channel: number,
    targetChannel: number | null,
}

async function copyToClipboard(textToCopy: string) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}

function ContextMenu({ userID, setChatNeedRefresh, setIsProfile, meFriends, channels, setChannelEditPWD, meBlocked, setChannelJoinPWD, setBanPopup, setMutePopup, setGameStatus }: {userID: number, setChatNeedRefresh: (arg: boolean) => void, setIsProfile: (arg: {id: number, nick: string}) => void, meFriends: any, channels: {[key: number]: ChannelType}, setChannelEditPWD: (arg: number | boolean) => void, meBlocked: {[key: number]: User}, setChannelJoinPWD: (arg: number | boolean) => void, setBanPopup: (arg: {id: number, channel: number} | boolean) => void, setMutePopup: (arg: {id: number, channel: number} | boolean) => void, setGameStatus: (arg: number) => void }) {
    const refContainer = useRef<HTMLDivElement>(null);
    const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);

    const ContextMenuAction: ContextMenuActionType = {
        "channel": (channel: ChannelType) => {
            return [
                {
                    text: "Définir un MDP",
                    action: () => {
                        setChannelEditPWD(channel.id);
                    },
                    can: () => {
                        return (channel.type === 1 && channel.owner === userID)
                    }
                },
                {
                    text: "Changer de MDP",
                    action: () => {
                        setChannelEditPWD(channel.id);
                    },
                    can: () => {
                        return (channel.type === 3 && channel.owner === userID)
                    }
                },
                {
                    text: "Retirer de MDP",
                    action: () => {
                        MRemovePWD(channel.id, () => {
                            setChatNeedRefresh(true);
                        })
                    },
                    can: () => {
                        return (channel.type === 3 && channel.owner === userID)
                    }
                },
                {
                    text: "Lien d'invitation",
                    action: async () => {
                        if (!channel.invite) return;
                        try {
                            await copyToClipboard(channel.invite);
                        } catch(error) {
                            console.error("Error handle by 42: ", error);
                        }
                    },
                    can: () => {
                        return (channel.type === 2)
                    }
                },
                {
                    text: "Rejoindre",
                    action: () => {
                        if (channel.type === 3) {
                            setChannelJoinPWD(channel.id);
                            return;
                        }
                        MJoinChannel(channel.id, "", () => {});
                    },
                    can: () => {
                        if (channel.users[userID]) return false;
                        return (channel.type !== 4)
                    }
                },
                {
                    text: "Quitter",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/leave/" + channel.id, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include"
                        }).then((res) => {
                            res.json().then((data) => {
                                if (res.ok)
                                    setChatNeedRefresh(true);
                                else
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (!channel.users[userID]) return false;
                        return (channel.type !== 4)
                    }
                },
                {
                    text: "Dissoudre",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/delete/" + channel.id, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include"
                        }).then((res) => {
                            res.json().then((data) => {
                                if (res.ok)
                                    setChatNeedRefresh(true);
                                else
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        return (channel.owner === userID && channel.type !== 4)
                    }
                },
            ]
        },
        "user": (user: User) => {
            return [
                {
                    text: "Profil",
                    action: () => {
                        setIsProfile({id: user.id, nick: user.nick})
                    },
                    can: () => {
                        return true
                    }
                },
                {
                    text: "Inviter à jouer",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/game/invite", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        return user.id !== userID
                    }
                },
                {
                    text: "Retirer d'ami",
                    action: () => {
                        MRemoveFriend(user.id, () => {})
                    },
                    can: () => {
                        return meFriends[user.id] && user.id !== userID
                    }
                },
                {
                    text: "Ajouter en ami",
                    action: () => {
                        MAddFriend(user.nick, () => {})
                    },
                    can: () => {
                        return !meFriends[user.id] && user.id !== userID
                    }
                },
                {
                    text: "Regarder la partie",
                    action: () => {
                        MSpectateGame(user.id, () => setGameStatus(2));
                    },
                    can: () => {
                        return user.id !== userID
                    }
                },
                {
                    text: "Bloquer",
                    action: () => {
                        MBlockUser(user.id, () => {})
                    },
                    can: () => {
                        return user.id !== userID && !meBlocked[user.id]
                    }
                },
                {
                    text: "Débloquer",
                    action: () => {
                        MBlockUser(user.id, () => {})
                    },
                    can: () => {
                        return user.id !== userID && meBlocked[user.id]
                    }
                },
                {
                    text: "Mute",
                    action: () => {
                        setMutePopup({
                            id: user.id,
                            channel: user.targetChannel as number
                        });
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te mute toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé
                        
                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin && !channel.users[userID].owner) return false; // Tu ne peux pas demute un admin
                        if (!channel.users[userID].admin) return false; // Si tu n'es pas admin du channel
                        return (channel.users[user.id].mute <= Date.now()/1000)
                    }
                },
                {
                    text: "Demute",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/mute", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id,
                                channel: user.targetChannel,
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te mute toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé
                        
                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin && !channel.users[userID].owner) return false; // Tu ne peux pas demute un admin
                        if (!channel.users[userID].admin) return false; // Si tu n'es pas admin du channel
                        return (channel.users[user.id].mute > Date.now()/1000)
                    }
                },
                {
                    text: "Kick",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/kick", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id,
                                channel: user.targetChannel,
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te kick toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé
                        
                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin && !channel.users[userID].owner) return false; // Tu ne peux pas kick un admin
                        if (!channel.users[userID].admin) return false; // Si tu n'es pas admin du channel
                        return true
                    }
                },
                {
                    text: "Bannir",
                    action: () => {
                        setBanPopup({
                            id: user.id,
                            channel: user.targetChannel as number
                        });
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te ban toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé
                        
                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin && !channel.users[userID].owner) return false; // Tu ne peux pas ban un admin
                        if (!channel.users[userID].admin) return false; // Si tu n'es pas admin du channel
                        return (channel.users[user.id].ban <= (Date.now() / 1000))
                    }
                },
                {
                    text: "Débannir",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/ban", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id,
                                channel: user.targetChannel,
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te ban toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé

                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin && !channel.users[userID].owner) return false; // Tu ne peux pas ban un admin
                        if (!channel.users[userID].admin) return false; // Si tu n'es pas admin du channel
                        return (channel.users[user.id].ban > (Date.now() / 1000))
                    }
                },
                {
                    text: "Promouvoir",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/promote", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id,
                                channel: user.targetChannel,
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te ban toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé

                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (channel.users[user.id].admin) return false; // Tu ne peux pas promote un admin
                        if (!channel.users[userID].owner) return false; // Si tu n'es pas owner du channel
                        return (!channel.users[user.id].admin)
                    }
                },
                {
                    text: "Rétrograder",
                    action: () => {
                        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/promote", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user.id,
                                channel: user.targetChannel,
                            })
                        }).then((res) => {
                            res.json().then((data) => {
                                if (!res.ok)
                                    OpenError(data.message);
                            });
                        })
                    },
                    can: () => {
                        if (user.id === userID) return false; // Tu peux pas te ban toi même
                        if (!user.targetChannel || !channels[user.targetChannel] || !channels[user.targetChannel].users || channels[user.targetChannel].type === 4) return false; // Si tu n'es pas dans un channel ou que le channel n'existe pas ou que le channel est un channel privé

                        const channel = channels[user.targetChannel];
                        if (!channel.users[userID] || !channel.users[user.id]) return false; // Si tu n'es pas dans le channel ou que l'utilisateur n'est pas dans le channel
                        if (!channel.users[userID].owner) return false; // Si tu n'es pas owner du channel
                        return (channel.users[user.id].admin)
                    }
                }
            ]
        }
    }

    useEffect(() => {
        function handleContextMenu(e: MouseEvent) {
            if (!refContainer.current) return;
            
            const target = e.target as HTMLElement;
            if (!target) {
                refContainer.current.style.display = "none";
                return;
            }
            
            const contextInfoType = target.getAttribute("data-contextmenutype");
            const contextInfoContent = target.getAttribute("data-contextmenucontent");
            if (!contextInfoType || !contextInfoContent) {
                refContainer.current.style.display = "none";
                return;
            }

            const parseInfo = JSON.parse(contextInfoContent)
            if (!parseInfo) return;

            let count = 0;
            if (parseInfo && contextInfoType && ContextMenuAction[contextInfoType]) {
                for (const action of ContextMenuAction[contextInfoType](parseInfo)) {
                    if (action.can && !action.can()) continue;
                    count++;
                }
            }

            e.preventDefault();
            if (count === 0) {
                refContainer.current.style.display = "none";
                return;
            }
    
            refContainer.current.style.display = "block";
            refContainer.current.style.left = e.pageX + "px";
            refContainer.current.style.top = e.pageY + "px";
            setContextInfo({
                "type": contextInfoType,
                "content": parseInfo
            })

            setTimeout(() => {
                if (!refContainer.current) return;
                const size = refContainer.current.getBoundingClientRect();
                if (size.left + size.width > window.innerWidth) {
                    refContainer.current.style.left = (window.innerWidth - size.width - 30) + "px";
                }
                if (size.top + size.height > window.innerHeight) {
                    refContainer.current.style.top = (window.innerHeight - size.height - 30) + "px";
                }
            }, 0)
        }

        function handleContextMenuClose(e: MouseEvent) {
            if (!refContainer.current) return;
            refContainer.current.style.display = "none";
            setContextInfo(null);
        }

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("click", handleContextMenuClose)

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("click", handleContextMenuClose)
        }
    })
    

    return (
        <div ref={refContainer} className="ContextMenu" style={{ display: contextInfo ? "block" : "none" }}>
            {contextInfo && ContextMenuAction[contextInfo.type] ? (
                ContextMenuAction[contextInfo.type](contextInfo.content).map((action, index) => {
                    if (action.can && !action.can()) return null; // Ici tu peux mettre en commentaire la condition pour afficher les actions qui ne sont pas possible
                    return (
                        <div key={index} className="ContextMenuAction" onClick={(e) => {
                            e.preventDefault();
                            action.action()
                            if (!refContainer.current) return;
                            refContainer.current.style.display = "none";
                            setContextInfo(null);
                        }}>{action.text}</div>
                    )
                })
            ) : (
                <div className="ContextMenuAction">No action available</div>
            )}
        </div>
    )
}

export default ContextMenu;