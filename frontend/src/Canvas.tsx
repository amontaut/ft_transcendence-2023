import React, { useState, useRef, useEffect } from 'react'
import './Canvas.css'
import { ButtonContainers } from './Button';
import RetreiveSocket, { RegisterNet } from "./Socket";
import { MFetchMatch } from './Utils';
const socket = RetreiveSocket();

// Game Data from server
interface IGameData {
    id: string;
    rightPaddle: {
        y: number;
    };
    leftPaddle: {
        y: number;
    };
    ball: {
        x: number;
        y: number;
    };
    score: {
        left: number;
        right: number;
    };
}

const height = 328;
const width = 748;
const grid = 15;
const paddleHeight = grid * 5;
let upIsPressed = false;
let downIsPressed = false;
const ballSpeed = 2;

const leftPaddle = {
    // start in the middle of the game on the left side
    x: 0,
    y: height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0
};

const rightPaddle = {
    // start in the middle of the game on the right side
    x: width - grid,
    y: height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0
};

const ball = {
    // start in the middle of the game
    x: width / 2,
    y: height / 2,
    radius: grid / 2,
    width: grid,
    height: grid,
    // keep track of when need to reset the ball position
    resetting: false,
    // ball velocity (start going to the top-right corner)
    dx: ballSpeed,
    dy: -ballSpeed
};

interface IObject {
    x: number;
    y: number;
    radius: number;
    width: number;
    height: number;
}

interface IPaddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

const drawPaddle = (context: CanvasRenderingContext2D, paddle: IPaddle, isTurbo: boolean) => {
    // context.fillStyle = '#4B5AF9';
    context.fillStyle = (!isTurbo && "#4B5AF9") || "#e47230";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

const drawBall = (context: CanvasRenderingContext2D, ball: IObject, isTurbo: boolean) => {
    // context.fillStyle = '#4B5AF9';
    context.fillStyle = (!isTurbo && "#4B5AF9") || "#e47230";
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
}

const keyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyW') {
        upIsPressed = true;
    }
    else if (e.code === 'KeyS') {
        downIsPressed = true;
    }
};
const keyup = (e: KeyboardEvent) => {
    if (e.code === 'KeyW') {
        upIsPressed = false;
    }
    else if (e.code === 'KeyS') {
        downIsPressed = false;
    }

};

function CanvasTimer({ gameTimeLeft, gameStarted }: { gameTimeLeft: number, gameStarted: boolean }) {
    const [time, setTime] = useState(gameTimeLeft);
    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [time])

    return (
        <div className="CanvasTimer">
            {gameStarted && (Math.floor(((gameTimeLeft) - Date.now()) / 1000))}
        </div>
    )
}

const updateVars = (data: IGameData, ball: IObject, rightPaddle: IPaddle, leftPaddle: IPaddle) => {
    ball.x = data.ball.x;
    ball.y = data.ball.y;
    rightPaddle.y = data.rightPaddle.y;
    leftPaddle.y = data.leftPaddle.y;
}

type GameInfo_T = {
    time: number,
    userID1: number,
    userID2: number,
    nick1: string,
    nick2: string,
    StartTimer: number,
    EndGame?: boolean,
    type: number,
}

type CanvasProps = {
    userID: number,
    gameStatus: number,
    setGameStatus: ((arg: number) => number) | ((arg: number) => void),
    gameInfo: GameInfo_T,
    gameGoal: boolean
}

const Canvas = ({ userID, gameStatus, setGameStatus, gameInfo, gameGoal }: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);


    const [inputStatus, setInputStatus] = useState({ up: false, down: false });

    const gameOver = useRef<any>(null);
    const winner = useRef<any>(null);
    const countdown = useRef<any>(null);
    const endOfGame = useRef<any>(null);

    const handlePlay = (toPlay: any) => {
        if (toPlay.current.isPlaying) return;
        toPlay.current.play();
        toPlay.current.isPlaying = true;
        toPlay.current.onended = () => {
            toPlay.current.isPlaying = false;
        }
    };

    RegisterNet("gameData", (args: any) => {
        updateVars(args, ball, rightPaddle, leftPaddle);
        setScore1(args.score.left);
        setScore2(args.score.right);
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyup);

        let animationFrameId: number;
        const render = () => {
            animationFrameId = window.requestAnimationFrame(render);
            context.clearRect(0, 0, canvas.width, canvas.height);

            drawPaddle(context, leftPaddle, gameInfo.type === 1);
            drawPaddle(context, rightPaddle, gameInfo.type === 1);
            drawBall(context, ball, gameInfo.type === 1);

            if (upIsPressed !== inputStatus.up || downIsPressed !== inputStatus.down) {
                const newInputStatus = { up: upIsPressed, down: downIsPressed }
                setInputStatus(newInputStatus)
                socket.emit("nets", { net: "UpdateInput", args: newInputStatus });
            }

            if (gameInfo.StartTimer === 3) {
                handlePlay(countdown);
            }
            if (gameInfo.EndGame === true) {
                if ((score1 === score2) && (gameInfo.userID1 === userID)) {
                    handlePlay(endOfGame);
                } else if ((score1 === score2) && (gameInfo.userID2 === userID)) {
                    handlePlay(endOfGame);
                } else if ((score1 > score2) && (gameInfo.userID1 === userID)) {
                    handlePlay(winner);
                } else if ((score1 > score2) && (gameInfo.userID2 === userID)) {
                    handlePlay(gameOver);
                } else if ((score1 < score2) && (gameInfo.userID1 === userID)) {
                    handlePlay(gameOver);
                } else if ((score1 < score2) && (gameInfo.userID2 === userID)) {
                    handlePlay(winner);
                }
            }
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [score1, score2, gameStatus, gameInfo, userID, inputStatus.down, inputStatus.up])


    return (
        <div className="Canvas">
            <div className="Score">
                {score1} - {score2}
            </div>
            <div className="CanvasContainer">
                <canvas width={width} height={height} ref={canvasRef} />
                {gameGoal && <div className="CanvasGoalText">GOAL</div>}
                {(gameInfo.StartTimer >= 0) && <div key={gameInfo.StartTimer + "TimerStart"} className="CanvasGoalText">{((gameInfo.StartTimer === 0) && "GO") || gameInfo.StartTimer}</div>}
                {(gameInfo.EndGame === true && <div className="CanvasGoalText">
                    {
                        ((score1 === score2) && "ÉGALITÉ") || ((score1 > score2 && gameInfo.userID1 === userID) && "VICTOIRE") || ((score1 > score2 && gameInfo.userID2 === userID) && "DÉFAITE") || ((score1 < score2 && gameInfo.userID1 === userID) && "DÉFAITE") || ((score1 < score2 && gameInfo.userID2 === userID) && "VICTOIRE")
                    }
                </div>)}
                {(gameStatus === 1) && <div className="CanvasWait"></div>}
                {(gameStatus === 4 || gameStatus === 2) && <CanvasTimer gameTimeLeft={gameInfo.time} gameStarted={gameInfo.StartTimer <= 0} />}
            </div>

            {(gameStatus === 4 || gameStatus === 2) && (
                <div className="CanvasUserContainer">
                    <div className="CanvasUser">
                        <img src={(process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/avatar/" + gameInfo.userID1 + ".png"} alt=" " />
                    </div>
                    <div>{gameInfo.nick1}</div>
                </div>
            )}
            {(gameStatus === 4 || gameStatus === 2) && (
                <div className="CanvasUserContainer" style={{ right: "10px", left: "unset" }}>
                    <div>{gameInfo.nick2}</div>
                    <div className="CanvasUser">
                        <img src={(process.env.REACT_APP_IP || "") + (process.env.REACT_APP_PORT_BACK || "") + "/avatar/" + gameInfo.userID2 + ".png"} alt=" " />
                    </div>
                </div>
            )}

            {(gameStatus === 0 && (
                <div className="CanvasActionContainer">
                        <ButtonContainers style={{ flex: "1" }} onClick={() => {
                            MFetchMatch(0, (data) => {
                                setGameStatus(data.status)
                            })
                        }}>
                            <div>Mode Normal</div>
                        </ButtonContainers>
                        <ButtonContainers style={{ flex: "1" }} onClick={() => {
                            MFetchMatch(1, (data) => {
                                setGameStatus(data.status)
                            })
                        }}>
                            <div>Mode Turbo</div>
                        </ButtonContainers>
                </div>
            )) || (gameStatus !== 4 &&
                <ButtonContainers style={{ marginTop: "10px" }} onClick={() => {
                    MFetchMatch(0, (data) => {
                        setGameStatus(data.status)
                    })
                }}>
                    {((gameStatus === 1) && (
                        <div>Annuler la recherche</div>
                    )) || ((gameStatus === 2) && (
                        <div>Arrêter de regarder</div>
                    )) || ((gameStatus === 0) && (
                        <div>Rechercher une partie</div>
                    )) || (
                            <div></div>
                        )}
                </ButtonContainers>
                )}


            <div>
                {/*<div>
                    <audio ref={paddleHit}>
                        <source src='./paddleHit.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>

                <div>
                    <audio ref={wallHit}>
                        <source src='./wallHit.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>*/}

                <div>
                    <audio ref={gameOver}>
                        <source src='./gameOver.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>

                <div>
                    <audio ref={winner}>
                        <source src='./winner.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>

                <div>
                    <audio ref={endOfGame}>
                        <source src='./endOfGame.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>

                <div>
                    <audio ref={countdown}>
                        <source src='./countdown.mp3' type="audio/mpeg" />
                        <p>Your browser does not support the audio element.</p>
                    </audio>
                </div>
            </div>
        </div>
    );
}

export default Canvas

// convert to tsx