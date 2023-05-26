import React, {useState, useEffect} from 'react';
import ReactSwitch from 'react-switch';
import './App.css';
import Canvas from './Canvas';
import Body from './Body';
import Friend from './Friend';
import Chat from './Chat';
import Stats from './Stats';
import Profil from './Profil';
import PopupRequest, { OpenError, PopupError } from './PopupRequest';
import Popup from './Popup';
import Invite from './Invite';
import ContextMenu from './ContextMenu';
import RetreiveSocket, {RegisterNet} from "./Socket";
import Auth from './Auth';
import { MAddFriend, MCreateChannel, MRegisterNick, MJoinChannel, MSetPWD, MUpdaterNick } from "./Utils"
import { ChannelType, Message } from './Type'


RetreiveSocket();

function PongLogo() {
	return (
		<img src='kingpong.png' alt="Pong Logo" className='Pong-Logo' />
	);
}

function ToggleSwitch() {
	let theme:any = localStorage.getItem('data-theme');
	const [isDark, setIsDark] = useState(JSON.parse(theme));

	const handleChange =( val:any) => {
	  setIsDark(val)
	}
  
		useEffect(() => {
	  if (isDark) {
		document.body.classList.add('dark');
		localStorage.setItem("data-theme", "true")
	  } else {
		document.body.classList.remove('dark');
		localStorage.setItem("data-theme", 'false')
	  }
	}, [isDark]); 

	return (
	  <div>
		<ReactSwitch
		  checked={isDark}
		  onChange={handleChange}
		/>
	  </div>
	);
  }

function Header({openProfil, isRegister, userNick}: {openProfil: () => void, isRegister: boolean, userNick: string}) {
	return (
		<div className="Header">
			<div className='leftHeader'>
				<PongLogo />
				<div className="Title">KING PONG</div>
			</div>
			<div className='rightHeader'>
				<div  className='toggleMode'>
					<ToggleSwitch/>
					<p>Mode sombre</p>
				</div>
				<div>
					{isRegister && (<button className="Button Login" onClick={() => {
						openProfil();
					}}>
						{userNick}
					</button>)}
				</div>
			</div>
		</div>
	)
}

export default function App() {
	const [isRegister, setIsRegister] = useState(false);
	const [isFetched, setIsFetched] = useState(false);
	const [isProfile, setIsProfile] = useState<boolean | {id: number, nick: string}>(false);
	const [isConnected, setIsConnected] = useState(false);
	const [isFailed, setIsFailed] = useState(false);
	const [isAuth, setIsAuth] = useState(false);
	const [friendPopup, setFriendPopup] = useState(false);
	const [namePopup, setNamePopup] = useState(false);
	// useState with boolean and number
	const [channelPopup, setChannelPopup] = useState<boolean | number>(false);
	const [channelPassword, setChannelPassword] = useState<boolean | string>(false);
	const [channelInvite, setChannelInvite] = useState<boolean | number>(false);
	const [channelEditPWD, setChannelEditPWD] = useState<boolean | number>(false);
	const [channelJoinPWD, setChannelJoinPWD] = useState<boolean | number>(false);

	const [banPopup, setBanPopup] = useState<boolean | {id: number, channel: number}>(false);
	const [mutePopup, setMutePopup] = useState<boolean | {id: number, channel: number}>(false);

	const [meFriends, setMeFriends] = useState({});
	const [meHistories, setMeHistories] = useState<{win: boolean, date: any, ennemy: number, ennemyNick: string, score: number, ennemyScore: number}[]>([]);
	const [meBlocked, setMeBlocked] = useState({});
	const [messages, setMessages] = useState<any>({});

	const [userNick, setUserNick] = useState("");
	const [userID, setUserID] = useState(0);

	const [chatNeedRefresh, setChatNeedRefresh] = useState(true);
	const [chatID, setChatID] = useState<boolean | number>(false);
	const [chatOpen, setChatOpen] = useState(false);
	const [channels, setChannels] = useState<{[id: number]: ChannelType}>({});

	const [needFresh, setNeedFresh] = useState(false);
	const [needAuth, setNeedAuth] = useState(false);

	const [gameStatus, setGameStatus] = useState(0);
	const [gameInfo, setGameInfo] = useState<{time: number, userID1: number, userID2: number, nick1: string, nick2: string, StartTimer: number, EndGame?: boolean, type: number}>({time: 0, userID1: 0, userID2: 0, nick1: "", nick2: "", StartTimer: -1, type: 0});
	const [gameGoal, setGameGoal] = useState(false);

	function RefreshMe() {
		setIsRegister(false);
		setIsFetched(false);
	}

	function CreateChannel(type: number) {
		setChannelPopup(type);
	}

	RegisterNet("Status", (args: any) => {
		setMeFriends((oldFriends) => {
			let newFriends = {} as any;
			for (const [key, value] of Object.entries(oldFriends)) {
				newFriends[key as unknown as number] = value;
			}
			if (!newFriends[args.UserID]) return newFriends;
			newFriends[args.UserID].status = args.Status;
			return newFriends;
		});
	});

	RegisterNet("UpdateNick", (args: any) => {
		const id: number = args.id;
		const nick = args.nick;
		setMessages((oldMessages: {[id: number]: Message[]}) => {
			let newMessages: {[id: number]: Message[]} = {};
			for (const [key, value] of Object.entries(oldMessages)) {
				newMessages[key as unknown as number] = value;
			}
			for (const [key, value] of Object.entries(newMessages)) {
				for (const [key2, value2] of Object.entries(value)) {
					if (value2.author === id) {
						newMessages[key as unknown as number][key2 as unknown as number].nick = nick;
					}
				}
			}
			return newMessages;
		});

		setMeHistories((oldHistories) => {
			let newHistories = [];
			for (const [key, value] of Object.entries(oldHistories)) {
				newHistories[key as unknown as number] = value;
			}
			for (const [key, value] of Object.entries(newHistories)) {
				if (value.ennemy === id) {
					newHistories[key as unknown as number].ennemyNick = nick;
				}
			}
			return newHistories;
		});

		if (id === userID) {
			setUserNick(nick);
			return;
		}
		setMeFriends((oldFriends) => {
			let newFriends = {} as any;
			for (const [key, value] of Object.entries(oldFriends)) {
				newFriends[key as unknown as number] = value;
			}
			if (!newFriends[id]) return newFriends;
			newFriends[id].nick = nick;
			return newFriends;
		});
	});

	RegisterNet("NewHistory", (args: any) => {
		setMeHistories(args)
	});

	RegisterNet("FriendAdd", (args: any) => {
		const newFriend = args;
		setMeFriends((oldFriends) => {
			let newFriends = {} as any;
			for (const [key, value] of Object.entries(oldFriends)) {
				newFriends[key as unknown as number] = value;
			}
			newFriends[newFriend.id] = newFriend;
			setChatNeedRefresh(true);
			return newFriends;
		});
	});

	RegisterNet("FriendRemove", (args: any) => {
		const UserID = args;
		setMeFriends((oldFriends) => {
			let newFriends = {} as any;
			for (const [key, value] of Object.entries(oldFriends)) {
				newFriends[key as unknown as number] = value;
			}
			delete newFriends[UserID];
			setChatNeedRefresh(true);
			return newFriends;
		});
	});

	RegisterNet("FriendAccept", (args: any) => {
		const UserID = args;
		setMeFriends((oldFriends) => {
			let newFriends = {} as any;
			for (const [key, value] of Object.entries(oldFriends)) {
				newFriends[key as unknown as number] = value;
			}
			newFriends[UserID].pending = false;
			return newFriends;
		});
	});

	RegisterNet("NewMessage", (args: any) => {
		const message = args;
		setMessages((oldMessages: any) => {
			let newMessages = {} as any;
			for (const key of Object.keys(oldMessages)) {
				newMessages[key] = oldMessages[key as unknown as number];
			}
			newMessages[message.channel] = newMessages[message.channel] || [];
			newMessages[message.channel].push(message);
			return newMessages;
		});
	});

	function RecursiveTimer() {
		setTimeout(() => {
			setGameInfo((oldInfo) => {
				if (oldInfo.StartTimer === 0) return {...oldInfo}
				RecursiveTimer();
				return {...oldInfo, StartTimer: oldInfo.StartTimer - 1}
			})
		}, 1000);
	}

	RegisterNet("StartGame", (args: any) => {
		setGameStatus(4)
		args.StartTimer = args.StartTimer || 3;
		RecursiveTimer();
		setGameInfo(args)
	});

	RegisterNet("EndGame", (args: any) => {
		setGameStatus(0)
		setGameInfo((oldInfo) => {
			setTimeout(() => {
				setGameInfo((oldInfo) => {
					return {...oldInfo, EndGame: false}
				})
			}, 1000)
			return {...oldInfo, EndGame: true}
		})
	});

	RegisterNet("Goal", (args: any) => {
		setGameGoal(true)
		setTimeout(() => {
			setGameGoal(false)
		}, 1000)
	});

	RegisterNet("HistoryAdd", (args: any) => {
		const history = args;
		setMeHistories((oldHistories) => {
			let newHistories = [] as any;
			for (const value of oldHistories) {
				newHistories.push(value);
			}
			newHistories.push(history);
			return newHistories;
		});
	});

	RegisterNet("AuthStatus", (bool: boolean) => {
		setIsAuth(bool);
	});

	RegisterNet("ContextChannel", (args: any) => {
		setChannels((oldChannels: {[key: number]: ChannelType}) => {
			const channelID = args.channel;
			const newUserID = args.id;
			let newChannels: {[key: number]: ChannelType} = {};
			for (const [key, value] of Object.entries(oldChannels)) {
				newChannels[key as unknown as number] = value;
			}
			if (!newChannels[channelID]) return newChannels;
			if (args.index === "remove") {
				delete newChannels[channelID].users[newUserID];
			} else if (args.index === "add") {
				newChannels[channelID].users[newUserID] = args.value;
				if (userID === newUserID)
					setChatID(channelID);
			} else if (args.index === "owner") {
				newChannels[channelID].owner = newUserID;
				newChannels[channelID].users[newUserID].owner = true;
				newChannels[channelID].users[newUserID].admin = true;
			} else {
				newChannels[channelID].users[newUserID][args.index] = args.value;
			}

			return newChannels;
		});
	});
	RegisterNet("AddChannel", (args: any) => {
		const channel = args;
		setChannels((oldChannels) => {
			let newChannels = {} as any;
			for (const [key, value] of Object.entries(oldChannels)) {
				newChannels[key as unknown as number] = value;
			}
			newChannels[channel.id] = channel;
			return newChannels;
		});
	});

	RegisterNet("RemoveChannel", (args: any) => {
		const channelID = args;
		setChannels((oldChannels) => {
			let newChannels = {} as any;
			for (const [key, value] of Object.entries(oldChannels)) {
				newChannels[key as unknown as number] = value;
			}
			delete newChannels[channelID];
			return newChannels;
		});
	});

	RegisterNet("UpdateChannel", (args: any) => {
		setChannels((oldChannels) => {
			let newChannels = {} as any;
			for (const [key, value] of Object.entries(oldChannels)) {
				newChannels[key as unknown as number] = value;
			}
			newChannels[args.id].type = args.type;
			return newChannels;
		});
	});

	RegisterNet("BlockUser", (args: any) => {
		setMeBlocked((oldBlocked: {[key: number]: boolean}) => {
			let blocked: {[key: number]: boolean} = {};
			for (const [key, value] of Object.entries(oldBlocked)) {
				blocked[key as unknown as number] = value;
			}
			blocked[args.id] = args.value;
			return blocked;
		});
	});

	useEffect(() => {
		setNeedFresh(false);
		setIsFailed(false);
		if (!isFetched) {
			fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/me", {
				method: "POST",
				credentials: "include",
			}).then((response) => {
				response.json().then((data) => {
					if (data.needAuth) {
						setNeedAuth(true);
						return
					}
					setIsConnected(data.isConnected)
					setUserID(data.id);
					if (data.nick) {
						setIsRegister(true);
						setUserNick(data.nick);

						setMeFriends(data.friends);
						setMeHistories(data.histories);
						setIsAuth(data.auth)
						setMeBlocked(data.blocked);
					}
					setIsFetched(true);
				});
			}).catch((err) => {
				setIsFailed(true);
			});
		}
	}, [isFetched, isFailed, needFresh, meFriends, chatID, needAuth, meBlocked]);

	if (needAuth) {
		return (
			<div>
				<PopupRequest onConfirm={(value) => {
					fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/auth/token", {
						method: "POST",
						credentials: "include",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							token: value
						})
					}).then((res) => {
						res.json().then((data) => {
							if (res.ok) {
								setNeedAuth(false);
								RefreshMe();
							} else {
								OpenError(data.message)
								setTimeout(() => {
									window.location.reload();
								}, 1400);
							}
						});
					})
				}} onRemove={() => null} canRemove={() => false} placeholder="XXX XXX" title="2FA" />
				<PopupError />
			</div>
		)
	} else if (!isFetched) {
		return (
			<div className="App">
				<Header openProfil={() => setIsProfile({id: userID, nick: userNick})} isRegister={isRegister} userNick={userNick} />
				<div className="AppLoading">
					Chargement ...
				</div>
			</div>
		)
	} else if (!isConnected) {
		return (
			<div className="App">
				<Header openProfil={() => setIsProfile({id: userID, nick: userNick})} isRegister={isRegister} userNick={userNick} />
				<Popup title="" text="Se connecter" onConfirm={() => window.location.href = `${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/connect`} canRemove={() => false} onRemove={() => {}} />
			</div>
		)
	}

	return (
		<div className="App">
			<Header openProfil={() => setIsProfile({id: userID, nick: userNick})} isRegister={isRegister} userNick={userNick} />
			<Body>			
				<div className="ContainerLeft">
					<Friend meFriends={meFriends} userID={userID} setFriendPopup={setFriendPopup} chatID={chatID} setChatID={setChatID} setChatOpen={setChatOpen} setGameStatus={setGameStatus} />
					{/* <Stats meHistories={meHistories} setIsProfile={setIsProfile} /> */}
				</div>
				<div className="CanvasInviteContainers">
					<Canvas userID={userID} gameStatus={gameStatus} setGameStatus={setGameStatus} gameInfo={gameInfo} gameGoal={gameGoal} />
					<Invite />
				</div>
				<div className="ContainerLeft">
					<Stats meHistories={meHistories} setIsProfile={setIsProfile} />
				</div>
			</Body>

			<Chat chatNeedRefresh={chatNeedRefresh} setChatNeedRefresh={setChatNeedRefresh} createChannel={CreateChannel} userID={userID} chatID={chatID} setChatID={setChatID} meFriends={meFriends} messages={messages} setMessages={setMessages} chatOpen={chatOpen} setChatOpen={setChatOpen} channels={channels} setChannels={setChannels} meBlocked={meBlocked} setChannelInvite={setChannelInvite} setChannelJoinPWD={setChannelJoinPWD} />
			{isProfile && <Profil closeProfil={() => setIsProfile(false)} refreshPage={RefreshMe} data={isProfile} userID={userID} isAuth={isAuth} meFriends={meFriends} setChatID={setChatID} setChatOpen={setChatOpen} setNamePopup={setNamePopup} />}

			{!isRegister && (
				<PopupRequest onConfirm={(value) => MRegisterNick(value, RefreshMe)} onRemove={() => {}} canRemove={() => false} placeholder={"Terminator1234"} title={"Entrez un nom"} /> 
			)}

	
			{friendPopup && (
				<PopupRequest onConfirm={(value) => {
					setFriendPopup(false)
					MAddFriend(value, () => {})
				}} onRemove={() => setFriendPopup(false)} canRemove={() => true} placeholder="Entrez un pseudo" title="Demande d'ami" />
			)}

			{channelPopup && (
				<PopupRequest onConfirm={(value) => {
					setChannelPopup(false)
					if (channelPopup === 3) {
						setChannelPassword(value);
						return;
					}
					MCreateChannel(value, channelPopup as number, "", () => {
						setChatNeedRefresh(true);
					})
				}} onRemove={() => setChannelPopup(false)} canRemove={() => true} placeholder="Entrez un nom" title="Créer un salon" />
			)}
			{channelPassword && (
				<PopupRequest onConfirm={(value) => {
					setChannelPassword(false);
					MCreateChannel(channelPassword as string, 3, value, () => {
						setChatNeedRefresh(true);
					})
				}} onRemove={() => setChannelPassword(false)} canRemove={() => true} placeholder="Entrez un mot de passe" title="Créer un salon" />
			)}
			{channelInvite && (
				<PopupRequest onConfirm={(value) => {
					setChannelInvite(false);
					MJoinChannel(value, undefined, () => {
						setChatNeedRefresh(true);
					})
				}} onRemove={() => setChannelInvite(false)} canRemove={() => true} placeholder="Entrez une invitation" title="Rejoindre un channel" />
			)}
			{channelEditPWD && (
				<PopupRequest onConfirm={(value) => {
					MSetPWD(channelEditPWD as number, value, () => {
						setChatNeedRefresh(true);
					})
					setChannelEditPWD(false);
				}} onRemove={() => setChannelEditPWD(false)} canRemove={() => true} placeholder="un_mot_de_passe" title="Changer de MDP" />
			)}

			{channelJoinPWD && (
				<PopupRequest onConfirm={(value) => {
					MJoinChannel(channelJoinPWD as number, value, () => {
						setChatNeedRefresh(true);
					})
					setChannelJoinPWD(false);
				}} onRemove={() => setChannelJoinPWD(false)} canRemove={() => true} placeholder="Entrez le mot de passe" title="Channel vérouillé" />
			)}

			{typeof banPopup !== "boolean" && (
				<PopupRequest onConfirm={(value) => {
					fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/ban", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						credentials: "include",
						body: JSON.stringify({
							id: banPopup.id,
							channel: banPopup.channel,
							lenght: value
						})
					}).then((res) => {
						res.json().then((data) => {
							if (!res.ok)
								OpenError(data.message)
						});
					})
					setBanPopup(false);
				}} onRemove={() => setBanPopup(false)} canRemove={() => true} placeholder="Ban en min (0 = permanent)" title="Bannissement" number={true} />
			)}

			{typeof mutePopup !== "boolean" && (
				<PopupRequest onConfirm={(value) => {
					fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/mute", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						credentials: "include",
						body: JSON.stringify({
							id: mutePopup.id,
							channel: mutePopup.channel,
							lenght: value
						})
					}).then((res) => {
						res.json().then((data) => {
							if (!res.ok)
								OpenError(data.message)
						});
					})
					setMutePopup(false);
				}} onRemove={() => setMutePopup(false)} canRemove={() => true} placeholder="Mute en min (0 = permanent)" title="Mute" number={true} />
			)}

			{namePopup && (
				<PopupRequest onConfirm={(value) => {
					MUpdaterNick(value, () => {setNamePopup(false); setIsProfile(false)})
				}} onRemove={() => setNamePopup(false)} canRemove={() => true} placeholder="Entrez un nom" title="Changer de nom" />
			)}

			<ContextMenu userID={userID} setChatNeedRefresh={setChatNeedRefresh} setIsProfile={setIsProfile} meFriends={meFriends} channels={channels} setChannelEditPWD={setChannelEditPWD} meBlocked={meBlocked} setChannelJoinPWD={setChannelJoinPWD} setBanPopup={setBanPopup} setMutePopup={setMutePopup} setGameStatus={setGameStatus}/>
			<Auth />
			<PopupError />
		</div>
	);
}