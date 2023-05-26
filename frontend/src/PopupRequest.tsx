import React, { useState, useRef, useEffect } from "react"
import "./PopupRequest.css"
import TextEntry from "./TextEntry"
import TitleContainers from "./TitleContainers"
import { ButtonContainers } from "./Button"

type Props = {
    onConfirm: (value: string) => void
    onRemove: () => void
    canRemove: () => boolean
    placeholder: string
    title: string,
    number?: boolean
}

function PopupRequest({ onConfirm, onRemove, canRemove, placeholder, title, number = false }: Props) {
    const [value, setValue] = useState("");
    const refPopup = useRef<HTMLDivElement>(null);

    const handleValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }

    useEffect(() => {
        setTimeout(() => {
            if (refPopup.current === null) return;
            refPopup.current.style.transform = "translate(-50%, -50%)";
        }, 0);
    }, []);

    function ClosePopup(isConfirm: boolean) {
        if (refPopup.current === null) return;
        refPopup.current.style.transform = "translate(-50%, calc(-50% - 80vh))";
        setTimeout(() => {
            if (isConfirm) {
                onConfirm(value)
            } else {
                onRemove();
            }
        }, 200);
    }

    return (
        <div className="PopupRequestBackground" onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!canRemove()) return;
            ClosePopup(false)
        }}>
            <div ref={refPopup} className="PopupRequest"> 
                <TitleContainers title={title} />
                <TextEntry index="PopupText" placeholder={placeholder} onChange={handleValue} type={(number && "number") || "text"} />

                <ButtonContainers style={{marginTop: "10px"}} onClick={() => ClosePopup(true)}>
                    <div>Valider</div>
                </ButtonContainers>
            </div>
        </div>
    )
}

let setTextErrorCPY: (value: string) => void;
function setTextErrorSETTER(func: (value: string) => void) {
    setTextErrorCPY = func
}

export function OpenError(str: string) {
    setTextErrorCPY(str);
}

export function PopupError() {
    const refPopup = useRef<HTMLDivElement>(null);
    const refPopupBack = useRef<HTMLDivElement>(null);
    const [textError, setTextError] = useState("");

    setTextErrorSETTER(setTextError)

    useEffect(() => {
        setTimeout(() => {
            if (refPopup.current === null) return;
            refPopup.current.style.transform = "translate(-50%, -50%)";
        }, 100);
    }, [textError]);

    function ClosePopup() {
        if (refPopup.current === null) return;
        refPopup.current.style.transform = "translate(-50%, calc(-50% - 80vh))";
        setTimeout(() => {
            setTextError("");
            if (refPopupBack.current === null) return;
            refPopupBack.current.style.display = "none";
        }, 200);
    }

    if (textError === "") return null;

    return (
        <div ref={refPopupBack} className="PopupRequestBackground" onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            ClosePopup()
        }}>
            <div ref={refPopup} className="PopupRequest"> 
                <TitleContainers title={textError} />

                <ButtonContainers style={{marginTop: "10px"}} onClick={() => ClosePopup()}>
                    <div>OK</div>
                </ButtonContainers>
            </div>
        </div>
    )
}

export default PopupRequest