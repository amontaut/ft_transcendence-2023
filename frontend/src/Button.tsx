import React from "react"
import "./Button.css"

type Props = {
  onClick: () => void
  children: React.ReactElement
}

function Button({ onClick, children }: Props) {
  return (
    <button className="Logout" onClick={onClick}>
      {children}
    </button>
  )
}

type Props2 = {
  style?: React.CSSProperties
  onClick: () => void
  children: React.ReactElement
}

function ButtonContainers({ style, onClick, children }: Props2) {
  return (
    <button style={style} className="ButtonContainers" onClick={onClick}>
      {children}
    </button>
  )
}

export { Button, ButtonContainers }

  