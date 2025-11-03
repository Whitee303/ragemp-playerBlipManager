"use strict";
var blips = {};
var server = {
    sync: function sync(_, blip) {
        var unpackedJSON = JSON.parse(blip);
        blips[unpackedJSON.id] = unpackedJSON;
        mp.players.forEach(function(p) {
            p.call("blips:syncToClient", [
                blips[unpackedJSON.id]
            ]);
        });
    },
    playerJoin: function playerJoin(player) {
        player.call("blips:callCreateBlip", [
            {
                id: player.id,
                name: player.name
            }
        ]);
    // player.call('blips:syncEvery', [blips]);
    },
    playerQuit: function playerQuit(player) {
        mp.players.forEach(function(p) {
            p.call("blips:remove", [
                {
                    id: player.id
                }
            ]);
        });
        delete blips[player.id];
    }
};
mp.events.add("blips:syncer", server.sync);
mp.events.add("playerJoin", server.playerJoin);
mp.events.add("playerQuit", server.playerQuit);
