import React, { useEffect, useState } from 'react';
import { trpc } from "../utils/trpc";

import { Mod, ModRating, Source } from "@prisma/client";

import InfiniteScroll from 'react-infinite-scroller';

type ModBrowserArguments = {
    search: string | null
    categories: Array<number> | null
};

type ModRowArguments = {
    mod: Mod
};

const ModRow: React.FC<ModRowArguments> = ({ mod }) => {
    // Retrieve source.
    const srcUrl = (mod.ModSource != null && mod.ModSource.length > 0) ? mod.ModSource[0].sourceUrl : "";
    const srcQuery = trpc.source.getSource.useQuery({
        url: srcUrl
    });

    const src: Source | null = (srcQuery.data) ? srcQuery.data : null;

    // Retrieve rating.
    let positives = 0;
    let negatives = 0;
    let rating = 1;

    const ratingQuery = trpc.rating.getRatingsForMod.useQuery({
        url: mod.url,
        dateStart: null,
        dateEnd: null
    });

    if (ratingQuery.data && ratingQuery.isFetched) {
        ratingQuery.data.map((r: ModRating) => {
            if (r.positive)
                positives++;
            else
                negatives++;
        });

        rating = positives - negatives;
    }

    // Retrieve correct banner.   
    let banner = "/images/mod/default.png";

    if (src != null && src.banner != null)
        banner = src.banner;

    if (mod.banner != null && mod.banner.length > 0)
        banner = mod.banner;

    // Generate links.
    const viewLink = "/view/" + mod.url;
    const origLink = (src != null) ? "https://" + src.url + "/" + mod.ModSource[0].query : null;
    
    return (
        <div className="m-10 shadow-sm w-72 h-96 rounded bg-cyan-900/50 flex flex-col">
            <div className="modImage w-full h-36">
                <img className="w-full" src={banner} />
            </div>
            <div className="mainInfo grow ml-8 mr-8">
                    <h3 className="text-white text-xl font-bold text-center">{mod.name}</h3>
                    <p className="text-white text-base mt-2">{mod.description_short}</p>
                </div>
                <div className="modStats">

                </div>
                <div className="modLinks flex justify-center pb-4">
                    <a href={viewLink} className="text-white font-bold bg-blue-400 p-4 rounded-md">View</a>
                    {origLink != null && (
                        <a href={origLink} target="_blank" className="text-white font-bold bg-blue-400 p-4 rounded-md ml-4">Original</a>
                    )}
                </div>
        </div>
    );
};

const ModBrowser: React.FC<ModBrowserArguments> = ({ search, categories }) => {
    const [mods, setMods] = useState<Array<Mod>>([]);
    const [needMoreMods, setNeedMoreMods] = useState(true);
    const [modsVisible, setModsVisible] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    let modsPerPage = Number(process.env.MODS_PER_PAGE);

    if (isNaN(modsPerPage))
        modsPerPage = 10;

    const modQuery = trpc.mod.getAllModsBrowser.useQuery({
        search: search,
        categories: JSON.stringify(categories) ?? null,

        offset: modsVisible,
        count: modsPerPage
    });

    useEffect(() => {
        if (!isFetching)
            return;

        if (modQuery.isFetched && modQuery.data && modQuery.data.length < 1) {
            setNeedMoreMods(false);
            setIsFetching(false);
        } else if (modQuery.isFetched && modQuery.data && modQuery.data.length > 0 ) {
            const curVisibleMods = modsVisible;

            // Set visible number.
            setModsVisible(curVisibleMods + modsPerPage);

            // Set our mods
            setMods([...mods, ...modQuery.data ?? []]);

            // We're no longer fetching.
            setIsFetching(false);
        }
    }, [isFetching, modQuery.data]);

    const fetchMods = async () => {
        if (isFetching)
            return;

        modQuery.refetch();
        setIsFetching(true);
    };

    return (
        <InfiniteScroll
            loadMore={fetchMods}
            hasMore={needMoreMods}
            loader={<div className="loadindicator">Loading...</div>}
        >
            <div className="grid grid-flow-col">
                {mods.map(mod => {
                    return (
                        <React.Fragment key={mod.id}>
                            <ModRow
                                mod={mod}
                            ></ModRow>
                        </React.Fragment>
                    );
                })}
            </div>
        </InfiniteScroll>
    );
};

export default ModBrowser;