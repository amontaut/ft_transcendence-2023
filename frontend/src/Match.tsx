import React from 'react'
import './Match.css'

import TitleContainers from './TitleContainers'
import { FormatDate } from './ChatBox'

type historyType = {
    win: boolean,
    date: any,
    ennemy: number,
    ennemyNick: string,
    score: number,
    ennemyScore: number
}

function MatchDetail({history, setIsProfile}: {history: historyType, setIsProfile: (arg0: {id: number, nick: string}) => void}) {
    const formDate = FormatDate(history.date)
    return (
        <div className="MatchDetail">
            <div className="MatchIcon">
                <img src={`${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/avatar/${history.ennemy}.png?useless=ImageFriend` + history.ennemy + (Date.now()/1000)} alt="0" />
            </div>
            <div className="MatchInfo">
                {(history.score === history.ennemyScore && (
                    <div className="MatchResult" style={{color: "#FFD969"}}>
                        ÉGALITÉ <div className="MatchScore">{`(${history.score} - ${history.ennemyScore})`}</div>
                    </div>
                )) || (history.win && (
                    <div className="MatchResult" style={{color: "#69FF8A"}}>
                        VICTOIRE <div className="MatchScore">{`(${history.score} - ${history.ennemyScore})`}</div>
                    </div>
                )) || (
                    <div className="MatchResult" style={{color: "#FF6969"}}>
                        DÉFAITE <div className="MatchScore">{`(${history.score} - ${history.ennemyScore})`}</div>
                    </div>
                )}

                <div className="MatchName">
                    <b>VS</b> {history.ennemyNick} - {formDate}
                </div>
            </div>

            <div className="MatchActionContainer">
                <div className="MatchAction" onClick={() => {
                    setIsProfile({id: history.ennemy, nick: history.ennemyNick})
                }}>
                    <img src="./user.png" className="MatchActionIcon" alt="user.png" />
                </div>
            </div>
        </div>
    )
}

function Match({meHistories, setIsProfile}: {meHistories: historyType[], setIsProfile: (arg0: {id: number, nick: string}) => void}) {
    return (
        <div className="Match">
            <div className="MatchHeader">
                <TitleContainers title="Historiques" />
                {/* <div className="MatchReturn" onClick={backStats}>
                    &lt;
                </div> */}
            </div>
            <div className="MatchContainers">
                {meHistories.map((history: historyType, index) => {
                    return (
                        <MatchDetail key={index} history={history} setIsProfile={setIsProfile} />
                    )
                })}
            </div>
        </div>
    )
}

export default Match