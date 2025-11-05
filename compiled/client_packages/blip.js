"use strict";
var localPlayer = mp.players.local;
var allBlips = {};
var client = {
    createBlips: function createBlips(data) {
        var unpackedData;
        if (typeof data == "string") {
            unpackedData = JSON.parse(data);
        } else if (typeof data != "string") {
            unpackedData = data;
        }
        if (allBlips[data.id] || unpackedData[data.id]) {
            return new Error("This id already exists!");
        }
        var blip = mp.blips.new(unpackedData.sprite, new mp.Vector3(0, 0, 72), {
            name: unpackedData.name,
            color: unpackedData.color,
            shortRange: false
        });
        blip.setCategory(7);
        allBlips[unpackedData.id] = blip;
        return blip;
    },
    callCreateBlip: function callCreateBlip(data) {
        mp.events.callRemote("blips:syncer", JSON.stringify({
            id: data.id,
            sprite: 1,
            name: data.name,
            color: 4
        }));
    },
    syncEveryAfterJoin: function syncEveryAfterJoin(everyBlip) {
        Object.keys(everyBlip).forEach(function(v, i) {
            client.createBlips({
                id: everyBlip[i].id,
                sprite: everyBlip[i].sprite,
                name: everyBlip[i].name,
                color: everyBlip[i].color
            });
        });
    },
    doRemoveAfterQuit: function doRemoveAfterQuit(data) {
        var foundedBlip = allBlips[data.id];
        if (foundedBlip) {
            foundedBlip.destroy();
            delete allBlips[data.id];
            return;
        }
    },
    updateClientAllBlips: function updateClientAllBlips(data) {
        var blip = allBlips[data.id];
        if (blip) {
            blip.position = data.pos;
        }
    }
};
mp.events.add("blips:syncToClient", client.createBlips);
mp.events.add("blips:callCreateBlip", client.callCreateBlip);
mp.events.add("blips:syncEvery", client.syncEveryAfterJoin);
mp.events.add("blips:updateBlips", client.updateClientAllBlips);
