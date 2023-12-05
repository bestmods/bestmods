import { useContext, useEffect } from "react"
import { ViewPortCtx } from "./main";

export default function Background ({
    image,
    overlay = true 
}: {
    image?: string,
    overlay?: boolean
}) {
    const viewPort = useContext(ViewPortCtx);

    return (
        <div
            className={`top-0 left-0 w-full h-full -z-50 fixed bg-fixed bg-center bg-no-repeat bg-cover bg-gradient-to-b from-[#002736] to-[#00151b]${(image && overlay && !viewPort.isMobile) ? ` brightness-[20%]` : ``}`}
            style={{
                backgroundImage: (!viewPort.isMobile && image) ? `url('${image}')` : undefined
            }}
        ></div>
    )
}