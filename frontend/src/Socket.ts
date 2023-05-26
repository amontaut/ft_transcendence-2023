import io from "socket.io-client";
var socket : any = null;
var Nets: {[id: string]: (data: any) => void} = {};
function RetreiveSocket() {
	if (socket) {
		return socket;
	}
	socket = io(`${process.env.REACT_APP_IP}3001`, {withCredentials: true});
	socket.on("nets", (data: any) => {
		console.log("RECEIVED NET: " + data.net)
		if (Nets[data.net]) {
			Nets[data.net](data.args);
		}
	});
	return socket;
}

function RegisterNet(name: string, callback: (data: any) => void) {
	Nets[name] = callback;
}

export default RetreiveSocket;
export {RegisterNet};