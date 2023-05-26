import React from 'react';
import './Body.css';

function Body({children}: {children: React.ReactElement[]}) {
	return (
		<div className="Body">
			{children}
		</div>
	);
}

export default Body;
