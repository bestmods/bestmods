import { type ModRowBrowser } from "~/types/mod";
import ModRow from "./browser/row";

import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";
import { useContext, useEffect, useRef, useState } from "react";
import { ViewPortCtx } from "@components/main";
import { ArrowFix } from "@components/carousel";
import { GetRandomInt } from "@utils/Random";
import { trpc } from "@utils/trpc";
import Loading from "@components/loading";

export default function ModSlideshow ({
    mods = [],

    infinite = true,
    autoPlay = true,
    autoPlaySpeedMin,
    autoPlaySpeedMax,
    defaultDevice = "md",
    showRowBottom = true,

    ssr = true,
    categories,
    sort,
    limit = 10,
    timeframe
} : {
    mods?: ModRowBrowser[]
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeedMin?: number
    autoPlaySpeedMax?: number
    defaultDevice?: string
    showRowBottom?: boolean

    ssr?: boolean
    categories?: number[]
    sort?: number
    limit?: number
    timeframe?: number
}) {
    const getMut = trpc.mod.getAllBrowser.useQuery({
        count: limit,
        categories: categories,
        sort: sort,
        timeframe: timeframe,
        incSources: false,
        incInstallers: false,
        incDownloads: false,
        incVisibleColumn: false,
        visible: true
    }, {
        enabled: false
    })

    const [modRows, setModRows] = useState(mods);

    const fetch = useRef(true);
    const addMore = useRef(true);

    const newMods = getMut.data?.mods;

    useEffect(() => {
        if (!fetch.current || ssr || modRows.length > 0)
            return;

        getMut.refetch();

        fetch.current = false;
    }, [fetch, getMut, ssr, modRows])

    const isLoading = modRows.length < 1 && getMut.isFetching;

    useEffect(() => {
        if (!addMore.current || ssr || getMut.isFetching || !newMods)
            return;

        setModRows([...newMods])

        addMore.current = false;
    }, [addMore, ssr, getMut, newMods])

    const viewPort = useContext(ViewPortCtx);

    // We need to manually specify our resposiveness due to the way `react-multi-carousel` works.
    const responsive = {
        xl5: {
            breakpoint: { max: 4000, min: 3167 },
            items: 9
        },
        xl4: {
            breakpoint: { max: 3167, min: 2832 },
            items: 8
        },
        xl3: {
            breakpoint: { max: 2832, min: 2496 },
            items: 7
        },
        xl2: {
            breakpoint: { max: 2496, min: 2160 },
            items: 6
        },
        xl: {
            breakpoint: { max: 2160, min: 1844 },
            items: 5
        },
        lg: {
            breakpoint: { max: 1844, min: 1488 },
            items: 4
        },
        md: {
            breakpoint: { max: 1488, min: 1152 },
            items: 3
        },
        sm: {
            breakpoint: { max: 1152, min: 816 },
            items: 2
        },
        xs: {
            breakpoint: { max: 816, min: 0 },
            items: 1
        }
    };

    // Retrieve play speed.
    const [playSpeed, setPlaySpeed] = useState<number | undefined>(undefined);

    if (typeof autoPlaySpeedMin !== "undefined" && typeof autoPlaySpeedMax !== "undefined" && !playSpeed)
        setPlaySpeed(GetRandomInt(autoPlaySpeedMin, autoPlaySpeedMax))

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center">
                    <Loading />
                </div>
            ) : (
                <Carousel
                    responsive={responsive}
                    itemClass="p-2 min-h-[30rem]"
                    infinite={infinite}
                    autoPlay={!viewPort.isMobile ? autoPlay : false}
                    autoPlaySpeed={playSpeed}
                    ssr={ssr}
                    deviceType={defaultDevice}
                    customLeftArrow={
                        <ArrowFix>
                            <button aria-label="Go to previous slide" className="react-multiple-carousel__arrow react-multiple-carousel__arrow--left !z-10" type="button"></button>
                        </ArrowFix>
                    }
                    customRightArrow={
                        <ArrowFix>
                            <button aria-label="Go to next slide" className="react-multiple-carousel__arrow react-multiple-carousel__arrow--right !z-10" type="button"></button>
                        </ArrowFix>
                    }
                >
                    {modRows.map((mod, index) => {
                        return (
                            <ModRow
                                key={`mod-${index.toString()}`}
                                showRelations={false}
                                showBottom={showRowBottom}
                                mod={mod}
                            />
                        )
                    })}
                </Carousel>
            )}
        </>
    )
}