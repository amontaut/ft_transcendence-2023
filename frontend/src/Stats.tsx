import React from "react";
import Match from "./Match";

function Stats({meHistories, setIsProfile}: {meHistories: any, setIsProfile: (arg0: {id: number, nick: string}) => void}) {
    return (
        <Match meHistories={meHistories} setIsProfile={setIsProfile}/>
    )
}

export default Stats