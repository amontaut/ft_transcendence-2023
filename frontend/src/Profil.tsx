import React, { useEffect, useRef, useState } from "react";
import "./Profil.css";
import { MAddFriend } from "./Utils";
import { OpenError } from "./PopupRequest";

function Profil({ closeProfil, refreshPage, data, userID, isAuth, meFriends, setChatID, setChatOpen, setNamePopup }: { closeProfil: () => void, refreshPage: () => void, data: any, userID: number, isAuth: boolean, meFriends: any, setChatID: any, setChatOpen: (arg0: boolean) => void, setNamePopup?: (arg0: boolean) => void }) {
    const refContainer = useRef<HTMLDivElement>(null);
    const refFileBrowser = useRef<HTMLInputElement>(null);
    const refImageIcon = useRef<HTMLImageElement>(null);
    const [lastUpdateImage, setLastUpdateImage] = useState(Date.now());
    const [dataStats, setDataStats] = useState<{ [key: string]: any }>({});

    let grandTotal: number = dataStats.totalMatch || 0;
    let yourTotal = dataStats.yourTotal || 0;
    let win = dataStats.win || 0;
    let lost = dataStats.lost || 0;
    let winGap: number = dataStats.winGap || 0;
    let lostGap: number = dataStats.lostGap || 0;

    function getGap(history: any, type: string) {
        let tmp = 0;
        for (let i = 0; i < history.length; i++) {
            if (type === 'win') {
                if (history[i].score > history[i].ennemyScore) {
                    if ((history[i].score - history[i].ennemyScore) > tmp)
                        tmp = history[i].score - history[i].ennemyScore;
                }

            }
            else if (type === 'lose') {
                if (history[i].score < history[i].ennemyScore) {
                    if ((history[i].ennemyScore - history[i].score) > tmp)
                        tmp = history[i].ennemyScore - history[i].score;
                }
            }
        }
        return (tmp)
    }

    useEffect(() => {
        setTimeout(() => {
            if (refContainer.current === null) return;
            refContainer.current.style.transform = "translateY(0px)";
        }, 0);

        if (dataStats.totalMatch === undefined) {
            fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/user/stats/" + data.id, {
                method: "GET",
                credentials: "include",
            }).then((res) => {
                res.json().then((data) => {
                    if (res.ok) {
                        let totalWin = 0;
                        let totalLost = 0;
                        for (let i = 0; i < data.history.length; i++) {
                            if (data.history[i].score === data.history[i].ennemyScore) continue;
                            if (data.history[i].win) {
                                totalWin++;
                            } else {
                                totalLost++;
                            }
                        }
                        let theWinGap = getGap(data.history, "win")
                        let theLoseGap = getGap(data.history, "lose")
                        setDataStats({ totalMatch: data.totalMatch, yourTotal: data.history.length, win: totalWin, lost: totalLost, winGap: theWinGap, lostGap: theLoseGap });
                    } else
                        OpenError(data.message);
                });
            })
        }
    }, [lastUpdateImage, isAuth, dataStats, data.id]);

    function CloseProfil(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (event.target === event.currentTarget) {
            if (refContainer.current === null) return;
            refContainer.current.style.transform = "translateY(-200%)";
            setTimeout(() => {
                closeProfil();
            }, 200);
        }
    }

    function OpenBrowserImage() {
        if (data.id !== userID) return;
        const fileBrowser = refFileBrowser.current;
        if (fileBrowser === null) return;
        fileBrowser.click();
    }

    function UploadImage() {
        const fileBrowser = refFileBrowser.current;
        if (fileBrowser === null || fileBrowser.files === null) return;
        const file = fileBrowser.files[0];
        if (file === undefined) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageIcon = refImageIcon.current;
            if (imageIcon === null) return;

            const formData = new FormData();
            formData.append("image", file);
            fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/avatar/upload", {
                method: "POST",
                body: formData,
                credentials: "include"
            }).then((res) => {
                res.json().then((data) => {
                    if (res.ok)
                        setLastUpdateImage(Date.now());
                    else
                        OpenError(data.message);
                });
            })
        }
        reader.readAsDataURL(file);
    }

    return (
        <div className="Profil" onClick={CloseProfil}>
            <div ref={refContainer} className="ProfilMove">
                <div className="ProfilHeader">
                    <div className="ProfilBannerContainer">
                        <img className="ProfilBanner" src="./kirby.gif" alt="gif" />
                    </div>
                    {/*<TitleContainers title="Profil" />*/}
                    <div className="ProfilIcon">
                        <div className={"ProfilIconImageContainer" + ((userID === data.id && " ProfilIconImageContainerAdd") || "")} onClick={OpenBrowserImage} >
                            <img ref={refImageIcon} src={`${process.env.REACT_APP_IP}${process.env.REACT_APP_PORT_BACK}/avatar/${data.id}.png?` + lastUpdateImage} alt="logo" className="ProfilIconImage" />
                            <input ref={refFileBrowser} type="file" accept=".png,.jpg,.gif" className="ProfilImageBrowser" onChange={UploadImage} />
                        </div>
                    </div>
                </div>
                <div className="ProfilContainer">
                    <div className="ProfilContainerTop">
                        <div className="ProfilMainInfo">
                            <div>
                                <div className="ProfilName">
                                    {data.nick}
                                </div>
                                {/*<div className="ProfilStatus">
                                    En ligne
                                </div>*/}
                            </div>
                            <div className="ProfilEmojiContainer">
                                <picture>
                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/512.gif" alt="😃" />
                                </picture>
                                <picture>
                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/512.gif" alt="🤯" />
                                </picture>
                                <picture>
                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/512.gif" alt="💖" />
                                </picture>
                            </div>
                        </div>
                        {(data.id === userID && (
                            (isAuth && (
                                <div className="ProfilRemote" onClick={() => {
                                    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/auth", {
                                        method: "POST",
                                        credentials: "include",
                                    }).then((res) => {
                                        res.json().then((data) => {
                                            if (!res.ok)
                                                OpenError(data.message);
                                        });
                                    })
                                }}>
                                    Désactiver 2FA
                                </div>)) || (
                                <div className="ProfilRemote" onClick={() => {
                                    fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/auth", {
                                        method: "POST",
                                        credentials: "include",
                                    }).then((res) => {
                                        res.json().then((data) => {
                                            if (!res.ok)
                                                OpenError(data.message);
                                        });
                                    })
                                }}>
                                    Activer 2FA
                                </div>
                            )
                        )) || ((!meFriends[data.id] && (
                            <div className="ProfilRemote" onClick={() => MAddFriend(data.nick, () => { })}>
                                Ajouter en ami
                            </div>
                        )) || (
                                <div className="ProfilRemote" onClick={() => {
                                    if (refContainer.current === null) return;
                                    refContainer.current.style.transform = "translateY(-200%)";
                                    setChatID(meFriends[data.id].channel);
                                    setTimeout(() => {
                                        closeProfil();
                                        setChatOpen(true);
                                    }, 200);
                                }}>
                                    Envoyer un message
                                </div>
                            ))}
                    </div>
                    <div className="ProfilContainerStats">
                        {/* Chiffres pour l'exemple a supp en haut du file */}
                        <div className="ProfilStatTotal">
                            {(grandTotal === 0) && <p>Aucune partie n'a encore été joué sur King Pong. Recherche une partie pour commencer !</p>}
                            {grandTotal === 1 && <p> Déja {grandTotal} partie a été jouée sur King Pong !</p>}
                            {grandTotal > 1 && <p>Déja {grandTotal} parties ont été jouées sur King Pong !</p>}
                        </div>
                        <div className="ProfilStatYourTotal">
                            <picture>
                                <img src={"./fight.png"} alt="Stats" className="StatsImage" />
                            </picture>
                            {data.id === userID && <p>Tu as joué un total de {yourTotal} partie{yourTotal > 1 && <span>s</span>} (soit {Math.round((yourTotal * 100) / (grandTotal || 1))}% de toutes les parties jouées sur King Pong).</p>}
                            {data.id !== userID && <p>{data.nick} a joué un total de {yourTotal} partie{yourTotal > 1 && <span>s</span>} (soit {Math.round((yourTotal * 100) / (grandTotal || 1))}% de toutes les parties jouées sur King Pong).</p>}

                        </div>
                        <div className="ProfilStatWinLoose">
                            <div className="ProfilStatWin">
                                <picture>
                                    <img src={"./win.png"} alt="Stats" className="StatsImage" />
                                </picture>
                                {data.id === userID && <p>Tu as gagné {win} partie{win > 1 && <span>s</span>} (soit  {Math.round((win * 100) / (yourTotal || 1))}% de tes parties).</p>}
                                {data.id !== userID && <p>{data.nick} a gagné {win} partie{win > 1 && <span>s</span>} (soit  {Math.round((win * 100) / (yourTotal || 1))}% de ses parties).</p>}
                            </div>
                            <div className="ProfilStatLoose">
                                <picture>
                                    <img src={"./loose.png"} alt="Stats" className="StatsImage" />
                                </picture>
                                {data.id === userID && <p>Tu as perdu {lost} partie{lost > 1 && <span>s</span>}  (soit  {Math.round((lost * 100) / (yourTotal || 1))}% de tes parties).</p>}
                                {data.id !== userID && <p>{data.nick} a perdu {lost} partie{lost > 1 && <span>s</span>}  (soit  {Math.round((lost * 100) / (yourTotal || 1))}% de ses parties).</p>}
                            </div>
                        </div>
                        <div className="profilStatGap">
                            <div className="ProfilStatGapWin">
                                <picture>
                                    <img src={"./plus.png"} alt="Stats" className="StatsImage" />
                                </picture>
                                {data.id === userID && <p>Le plus grand écart de points avec lequel tu as gagné est de {winGap}.</p>}
                                {data.id !== userID && <p>Le plus grand écart de points avec lequel {data.nick} a gagné est de {winGap}.</p>}
                            </div>
                            <div className="ProfilStatGapLoose">
                                <picture>
                                    <img src={"./moins.png"} alt="Stats" className="StatsImage" />
                                </picture>
                                {data.id === userID && <p>Le plus grand écart de points avec lequel tu as perdu est de {lostGap}.</p>}
                                {data.id !== userID && <p>Le plus grand écart de points avec lequel {data.nick} a perdu est de {lostGap}.</p>}
                            </div>
                        </div>
                    </div>
                    {(data.id === userID && (
                        <div>
                            <div className="ProfilAction" onClick={() => {
                                if (setNamePopup) setNamePopup(true)
                            }}>
                                Changer de nom
                            </div>
                            <div className="ProfilAction" onClick={() => {
                                fetch((process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/logout", {
                                    method: "POST",
                                    credentials: "include",
                                }).then((res) => {
                                    res.json().then((data) => {
                                        if (res.ok)
                                            refreshPage();
                                        else
                                            OpenError(data.message);
                                    });
                                });
                            }}>
                                Déconnexion
                            </div>
                        </div>
                        )
                    )}
                </div>
            </div>
        </div >
    )
}

export default Profil