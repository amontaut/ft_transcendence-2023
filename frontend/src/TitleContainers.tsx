import React from "react"
import "./TitleContainers.css"

function TitleContainers({title}: {title: string}) {
    return (
        <div className="TitleContainers">
            {title}
        </div>
    )
}

export default TitleContainers