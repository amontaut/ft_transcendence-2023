import React from "react"
import "./TextEntry.css"

type Props = {
	index: string,
	type: string,
	placeholder: string,
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function TextEntry({index, type, placeholder, onChange}: Props) {
	return (
		<div className="TextEntry">
			<input id={index} type={(type && type) || "text"} className="TextEntryInput" placeholder={placeholder} onChange={onChange} />
		</div>
	)
}

export default TextEntry