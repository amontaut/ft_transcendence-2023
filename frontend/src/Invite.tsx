import React, {useState} from 'react'
import "./Invite.css"
import { ButtonContainers } from './Button'
import { RegisterNet } from './Socket'
import { OpenError } from './PopupRequest';

export default function Invite() {
    const [invite, setInvite] = useState("");
    RegisterNet("Invite", (data: string) => {
        setInvite(data);
    });

    if (invite === "") {
        return (<div style={{display: "none"}}></div>);
    }
    return (
        <div className="Invite">
            <div>Invitation de {invite}</div>
            <div style={{display: "flex", columnGap: "20px"}}>
                <ButtonContainers style={{}} onClick={() => {
                    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/game/accept", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                    }).then((res) => {
                        res.json().then((data) => {
                            if (!res.ok)
                                OpenError(data.message);
                        });
                    })
                }}>
                    <div>Accepter</div>
                </ButtonContainers>

                <ButtonContainers style={{}} onClick={() => {
                    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/game/decline", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                    }).then((res) => {
                        res.json().then((data) => {
                            if (!res.ok)
                                OpenError(data.message);
                        });
                    })
                }}>
                    <div>Refuser</div>
                </ButtonContainers>
            </div>
        </div>
    )
}