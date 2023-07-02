import { trpc } from '../src/utils/trpc';

async function main() {
    const srcAdd = trpc.source.addSource.useMutation();
    const catAdd = trpc.category.addCategory.useMutation();
    const modAdd = trpc.mod.addMod.useMutation();

    /* Categories */
    // ID - 1
    catAdd.mutate({
        id: 0,
        parent_id: null,

        name: "Minecraft",
        name_short: "Minecraft",
        url: "minecraft",
    });

    // ID - 2
    catAdd.mutate({
        id: 0,
        parent_id: 1,

        name: "Models",
        name_short: "Models",
        url: "models",
    });

    // ID - 3
    catAdd.mutate({
        id: 0,
        parent_id: null,

        name: "Counter-Strike: Source",
        name_short: "CS:S",
        url: "css",
    });

    // ID - 4
    catAdd.mutate({
        id: 0,
        parent_id: 3,

        name: "Maps",
        name_short: "Maps",
        url: "css-maps",
    });

    // ID - 5
    catAdd.mutate({
        id: 0,
        parent_id: null,

        name: "Grand Theft Auto V",
        name_short: "GTA V",
        url: "gtav",
    });

    // ID - 6
    catAdd.mutate({
        id: 0,
        parent_id: 5,

        name: "Vehicles",
        name_short: "vehicles",
        url: "vehicles",
    });

    
    /* Sources */
    // ID - 1
    srcAdd.mutate({
        name: "Best Mods",
        url: "bestmods.io",
    });

    // ID - 2
    srcAdd.mutate({
        name: "The Modding Community",
        url: "moddingcommunity.com",
    });

    // ID - 3
    srcAdd.mutate({
        name: "Gamecom",
        url: "gamecom.io",
    });

    // ID - 4
    srcAdd.mutate({
        name: "Best Servers",
        url: "bestservers.io",
    });
}