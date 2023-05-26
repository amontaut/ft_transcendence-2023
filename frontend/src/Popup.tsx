import React, { useRef, useEffect } from "react"
import "./Popup.css"
import TitleContainers from "./TitleContainers"
import { ButtonContainers } from "./Button"

type Props = {
    onConfirm: () => void
    onRemove: () => void
    canRemove: () => boolean
    title: string
    text: string
}

function Popup({ onConfirm, onRemove, canRemove, title, text }: Props) {
    const refPopup = useRef<HTMLDivElement>(null);

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
                onConfirm()
            } else {
                onRemove();
            }
        }, 200);
    }

    return (
        <div className="PopupBackground" onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!canRemove()) return;
            ClosePopup(false)
        }}>
            <div ref={refPopup} className="Popup"> 
                <TitleContainers title={title} />

                <ButtonContainers style={{marginTop: "10px"}} onClick={() => ClosePopup(true)}>
                    <div>{text}</div>
                </ButtonContainers>
            </div>
        </div>
    )
}

export default Popup