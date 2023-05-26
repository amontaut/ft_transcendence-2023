import React, { useState, useRef, useEffect } from 'react';
import TitleContainers from './TitleContainers';
import { ButtonContainers } from './Button';
import "./PopupRequest.css"
import { RegisterNet } from './Socket';
import TextEntry from './TextEntry';
import { OpenError } from './PopupRequest';
const QRCode = require('qrcode')

export default function Auth() {
    const canvasQRCode = React.createRef<HTMLCanvasElement>();
    const refPopup = useRef<HTMLDivElement>(null);
    const [authURL, setAuthURL] = useState("");

    const [value, setValue] = useState("");
    const handleValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }

    function ClosePopup() {
        if (refPopup.current === null) return;
        refPopup.current.style.transform = "translate(-50%, calc(-50% - 80vh))";
        setTimeout(() => {
            setAuthURL("");
        }, 200);
    }

	function SendInfo() {
        fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/auth/confirm", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token: value}),
        }).then((res) => {
            res.json().then((data) => {
                if (res.ok)
                    ClosePopup()
                else
                    OpenError(data.message)
            });
        })
    }

    RegisterNet("Auth", (data: string) => {
        setAuthURL(data)
    });

    useEffect(() => {
        if (authURL === "") return;
        if (canvasQRCode.current) {
            QRCode.toCanvas(canvasQRCode.current, authURL, function (error: any) {
                if (error) return;
            })
        }

        setTimeout(() => {
            if (refPopup.current === null) return;
            refPopup.current.style.transform = "translate(-50%, -50%)";
        }, 0);
    }, [authURL, canvasQRCode])
    
    if (authURL === "")
        return (<div style={{display: "none"}}></div>);

    return (
        <div className="PopupRequestBackground" onClick={(e) => {
            if (e.target === e.currentTarget) {
                ClosePopup();
            }
        }}>
            <div ref={refPopup} className="PopupRequest"> 
                <TitleContainers title={"QR Code - 2AF"} />
                <canvas ref={canvasQRCode} style={{margin: "auto"}}></canvas>
                <TextEntry index="PopupText" placeholder={"XXX XXX"} onChange={handleValue} type={""} />
                <ButtonContainers style={{marginTop: "10px"}} onClick={SendInfo}>
                    <div>Confirmer</div>
                </ButtonContainers>
            </div>
        </div>
    )
}