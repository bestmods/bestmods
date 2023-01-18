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
        nameShort: "Minecraft",
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
        nameShort: "Models",
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
        nameShort: "CS:S",
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
        nameShort: "Maps",
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
        nameShort: "GTA V",
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
        nameShort: "vehicles",
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