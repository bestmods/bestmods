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

        icon: null,
        iremove: false,

        classes: null
    });

    // ID - 2
    catAdd.mutate({
        id: 0,
        parent_id: 1,

        name: "Models",
        name_short: "Models",
        url: "models",

        icon: null,
        iremove: false,

        classes: null
    });

    // ID - 3
    catAdd.mutate({
        id: 0,
        parent_id: null,

        name: "Counter-Strike: Source",
        name_short: "CS:S",
        url: "css",

        icon: null,
        iremove: false,

        classes: null
    });

    // ID - 4
    catAdd.mutate({
        id: 0,
        parent_id: 3,

        name: "Maps",
        name_short: "Maps",
        url: "css-maps",

        icon: null,
        iremove: false,

        classes: null
    });

    // ID - 5
    catAdd.mutate({
        id: 0,
        parent_id: null,

        name: "Grand Theft Auto V",
        name_short: "GTA V",
        url: "gtav",

        icon: null,
        iremove: false,

        classes: null
    });

    // ID - 6
    catAdd.mutate({
        id: 0,
        parent_id: 5,

        name: "Vehicles",
        name_short: "vehicles",
        url: "vehicles",

        icon: null,
        iremove: false,

        classes: null
    });

    
    /* Sources */
    // ID - 1
    srcAdd.mutate({
        name: "Best Mods",
        url: "bestmods.io",

        icon: null,
        banner: null,
        iremove: false,
        bremove: false,

        classes: null
    });

    // ID - 2
    srcAdd.mutate({
        name: "The Modding Community",
        url: "moddingcommunity.com",

        icon: null,
        banner: null,
        iremove: false,
        bremove: false,

        classes: null
    });

    // ID - 3
    srcAdd.mutate({
        name: "Gamecom",
        url: "gamecom.io",

        icon: null,
        banner: null,
        iremove: false,
        bremove: false,

        classes: null
    });

    // ID - 4
    srcAdd.mutate({
        name: "Best Servers",
        url: "bestservers.io",

        icon: null,
        banner: null,
        iremove: false,
        bremove: false,

        classes: null
    });
}