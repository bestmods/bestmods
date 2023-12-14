import { type ModRowBrowser } from "~/types/mod";
import ModRow from "./browser/row";

import "react-multi-carousel/lib/styles.css";
import Carousel from "react-multi-carousel";
import { useContext } from "react";
import { ViewPortCtx } from "@components/main";
import { ArrowFix } from "@components/carousel";

export default function ModSlideshow ({
    mods,
    infinite = true,
    autoPlay = true,
    autoPlaySpeed
} : {
    mods: ModRowBrowser[]
    infinite?: boolean
    autoPlay?: boolean
    autoPlaySpeed?: number
}) {
    const viewPort = useContext(ViewPortCtx);

    // We need to manually specify our resposiveness due to the way `react-multi-carousel` works.
    const responsive = {
        xl3: {
            breakpoint: { max: 4000, min: 2496 },
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

    return (
        <Carousel
            responsive={responsive}
            itemClass="p-2 min-h-[30rem]"
            infinite={infinite}
            autoPlay={!viewPort.isMobile ? autoPlay : false}
            autoPlaySpeed={autoPlaySpeed}
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
            {mods.map((mod, index) => {
                return (
                    <ModRow
                        key={`mod-${index.toString()}`}
                        showRelations={false}
                        mod={mod}
                    />
                )
            })}
        </Carousel>
    )
}