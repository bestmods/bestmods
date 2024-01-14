import { ViewPortCtx } from "@components/main";
import { type Dispatch, type SetStateAction, useContext, useState } from "react";

import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";

import { type ModViewItem } from "~/types/mod";
import { ArrowFix } from "@components/carousel";
import ImageWithFallback from "@components/image";
import { GetYoutubeEmbedLink } from "@utils/youtube";

export default function ModGallery ({
    mod,
    infinite = true,
    autoPlay = false,
    autoPlaySpeed
} : {
    mod: ModViewItem
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeed?: number
}) {
    const viewPort = useContext(ViewPortCtx);

    // We need to manually specify our resposiveness due to the way `react-multi-carousel` works.
    const responsive = {
        xl3: {
            breakpoint: { max: 4000, min: 1766 },
            items: 3
        },
        sm: {
            breakpoint: { max: 1766, min: 1062 },
            items: 2
        },
        xs: {
            breakpoint: { max: 1062, min: 0 },
            items: 1
        }
    };

    const [bigPicture, setBigPicture] = useState<string | undefined>(undefined);

    // Banner.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    let banner = "/images/default_mod_banner.png"

    if (mod.banner)
        banner = cdn + mod.banner;

    // Compile screenshots.
    const screenshots: string[] = [];
    let screenshotsCtn = 0;

    // Add banner to screenshots so we don't have to add separately.
    screenshots.push(banner);

    // Loop through each screenshot relation, check, and then add if check is successful.
    mod.ModScreenshot.map((ss) => {
        const url = ss.url;

        // Make sure we have a valid screenshot URL.
        if (!url.startsWith("https"))
            return;

        // Increment screenshot count and add to screenshots array.
        screenshotsCtn++;
        screenshots.push(url);
    })

    return (
        <>
            {bigPicture && !viewPort.isMobile && (
                <>
                    <div
                        className={`fixed z-40 left-0 top-0 w-full h-full bg-black/60 animate-fade-out-in duration-700`}
                        onClick={() => {
                            setBigPicture(undefined);
                        }}
                    ></div>
                    <div
                        className={`fixed z-50 left-1/2 top-1/2 w-[90%] h-[90%] animate-fade-out-in duration-700`}
                        style={{
                            transform: "translate(-50%, -50%)"
                        }}
                    >
                        <div className="relative ring-4 ring-bestmods-3 rounded w-full h-full">
                            <button
                                className="rounded-full w-8 h-8 bg-black/80 hover:bg-black/90 absolute right-1 top-1 text-sm"
                                onClick={() => {
                                    setBigPicture(undefined);
                                }}
                            >X</button>
                            <ImageWithFallback
                                src={bigPicture}
                                width={1920}
                                height={1080}
                                alt="Big Picture"
                                priority={true}
                                fallback="/images/default_mod_banner.png"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </>
            )}
            
            <Carousel
                responsive={responsive}
                itemClass="p-2 h-96"
                centerMode={false}
                infinite={infinite}
                autoPlay={!viewPort.isMobile ? autoPlay : false}
                autoPlaySpeed={autoPlaySpeed}
                containerClass={`react-multi-carousel-list ${screenshotsCtn < 1 ? "justify-center" : ""}`}
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
                {screenshots.map((url, index) => {
                    return (
                        <Screenshot
                            key={`screenshot-${index.toString()}`}
                            index={index}
                            url={url}
                            setBigPicture={setBigPicture}
                            nsfw={mod.nsfw}
                        />
                    )
                })}
            </Carousel>
        </>
    )
}

function Screenshot({
    index,
    url,
    setBigPicture,
    nsfw = false,
} : {
    index: number
    url: string
    setBigPicture: Dispatch<SetStateAction<string | undefined>>
    nsfw?: boolean
}) {
    const [isNsfw, setIsNsfw] = useState(nsfw);

    // Check for YouTube embed.
    const vidUrl = GetYoutubeEmbedLink(url);

    return (
            <div className={`w-full h-full`}>
                {isNsfw && (
                    <div className="absolute z-30 top-1/2 left-1/2">
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={() => setIsNsfw(false)}
                        >View</button>
                    </div>
                )}
                {vidUrl ? (
                    <iframe
                        src={vidUrl}
                        width="100%"
                        height="100%"
                        allowFullScreen={true}
                    ></iframe>
                ) : (
                    <ImageWithFallback
                        src={url}
                        width={1000}
                        height={333}
                        alt={`Screenshot #${index.toString()}`}
                        className={`rounded brightness-75 hover:brightness-100 duration-300 cursor-pointer w-full h-full max-h-full object-cover${isNsfw ? " filter blur-lg" : ""}`}
                        onClick={() => {
                            if (!isNsfw)
                                setBigPicture(url);
                        }}
                        fallback="/images/default_mod_banner.png"
                        priority={true}
                    />
                )}
            </div>
    )
}