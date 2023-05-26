import { OpenError } from "./PopupRequest"

function MAddFriend(nick: string, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/add", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({nick: nick}),
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MRegisterNick(value: string, callback: (value: boolean) => void) {
	fetch(`${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/user/register`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			nick: value
		})
	}).then((res) => {
		res.json().then((data) => {
            if (res.ok) {
                callback(true);
                window.location.reload();
            } else {
                OpenError(data.message)
                callback(false)
            }
        });
	})
}


function MCreateChannel(name: string, type: number, pwd: string, callback: (value: boolean) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/creation", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            type: type,
            password: pwd
        })
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MRemoveFriend(id: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/remove", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id}),
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MAcceptFriend(id: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/accept", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id}),
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MBlockUser(id: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/block", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id}),
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MJoinChannel(id: number | string, password?: string, callback?: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/join/" + id, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({password: password}),
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                if (callback) { callback(data) };
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MRemovePWD(id: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/pwd/remove/" + id, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MSetPWD(id: number, password: string, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/channel/pwd/set/" + id, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({password: password})
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MFetchMatch(type: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/game/matchmaking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({type: type})
    }).then((res) => {
        res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
    })
}

function MUpdaterNick(value: string, callback: (value: boolean) => void) {
	fetch(`${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/user/update`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			nick: value
		})
	}).then((res) => {
		res.json().then((data) => {
            if (res.ok) {
                callback(true);
            } else {
                callback(false)
                OpenError(data.message)
            }
        });
	})
}

function MSpectateGame(id: number, callback: (data: any) => void) {
    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/game/spectate", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: id,
        }),
    }).then((res) => {
		res.json().then((data) => {
            if (res.ok) {
                callback(data);
            } else {
                OpenError(data.message)
            }
        });
	})
}

export { MAddFriend, MRegisterNick, MCreateChannel, MRemoveFriend, MAcceptFriend, MBlockUser, MJoinChannel, MRemovePWD, MSetPWD, MFetchMatch, MUpdaterNick, MSpectateGame }