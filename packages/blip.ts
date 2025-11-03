interface BlipContainer {
	[key: number]: BlipMp;
}
interface ServerModule {
	sync: (player: PlayerMp, blip: string) => void;
	playerJoin: (player: PlayerMp) => void;
	playerQuit: (player: PlayerMp) => void;
}
const blips: BlipContainer = {};
const server: ServerModule = {
	sync (_: PlayerMp, blip: string) {
		const unpackedJSON = JSON.parse(blip);
		blips[unpackedJSON.id] = unpackedJSON;
		mp.players.forEach((p) => {
			p.call('blips:syncToClient', [blips[unpackedJSON.id]]);
		});
	},
	playerJoin (player: PlayerMp) {
		player.call('blips:callCreateBlip', [{ id: player.id, name: player.name }]);
		// player.call('blips:syncEvery', [blips]);
	},
	playerQuit (player: PlayerMp) {
		mp.players.forEach((p) => {
			p.call('blips:remove', [{ id: player.id }]);
		});
		delete blips[player.id];
	}
};
mp.events.add('blips:syncer', server.sync);
mp.events.add('playerJoin', server.playerJoin);
mp.events.add('playerQuit', server.playerQuit);