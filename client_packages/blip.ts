interface BlipData {
	id: number;
	sprite: number;
	name: string;
	color: number;
}

interface ClientModule {
	createBlips: (data: BlipData) => void;
	callCreateBlip: (data: BlipData) => void;
	syncEveryAfterJoin: (everyBlip: BlipContainer) => void;
	doRemoveAfterQuit: (data: BlipData) => void;
	updateClientAllBlips: (data: { id: number; pos: Vector3Mp }) => void;
}
interface BlipContainer {
	[key: number]: BlipMp;
}

const localPlayer = mp.players.local;
let allBlips: BlipContainer = {};

const client: ClientModule = {
	createBlips (data: BlipData) {
		let unpackedData;
		if (typeof data == "string") {
			unpackedData = JSON.parse(data);
		} else if (typeof data != "string") {
			unpackedData = data;
		}
		if (allBlips[data.id] || unpackedData[data.id]) {
			return new Error("This id already exists!");
		}
		const blip = mp.blips.new(unpackedData.sprite, new mp.Vector3(0, 0, 72), {
			name: unpackedData.name,
			color: unpackedData.color,
			shortRange: false
		});
		blip.setCategory(7);
		allBlips[unpackedData.id] = blip;
		return blip;
	},
	callCreateBlip (data: {}) {
		mp.events.callRemote('blips:syncer', JSON.stringify({ id: data.id, sprite: 1, name: data.name, color: 4 }));
	},
	syncEveryAfterJoin (everyBlip: {}) {
		Object.keys(everyBlip).forEach((v, i) => {
			client.createBlips({ id: everyBlip[i].id, sprite: everyBlip[i].sprite, name: everyBlip[i].name, color: everyBlip[i].color });
		});
	},
	doRemoveAfterQuit (data: {}) {
		const foundedBlip = allBlips[data.id] as BlipMp;
		if (foundedBlip) {
			foundedBlip.destroy();
			delete allBlips[data.id];
			return;
		}

	},
	updateClientAllBlips (data: { id: number; pos: Vector3Mp }) {
		const blip = allBlips[data.id];
		if (blip) {
			blip.position = data.pos;
		}
	}
};
mp.events.add('blips:syncToClient', client.createBlips);
mp.events.add('blips:callCreateBlip', client.callCreateBlip);
mp.events.add('blips:syncEvery', client.syncEveryAfterJoin);
mp.events.add('blips:updateBlips', client.updateClientAllBlips);
