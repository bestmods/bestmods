import Image from "next/image";
import { type MouseEventHandler, useState } from "react";

export default function ImageWithFallback({
    src,
    fallback,
    width = 500,
    height = 500,
    alt = "Image",
    className,
    priority,
    onClick
} : {
    src: string
    fallback?: string
    width?: number
    height?: number
    alt?: string
    className?: string
    priority?: boolean
    onClick?: MouseEventHandler<HTMLImageElement>
}) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);

    return (
        <>
            {imgSrc && (
                <Image
                    src={imgSrc}
                    width={width}
                    height={height}
                    alt={alt}
                    className={className}
                    onClick={onClick}
                    priority={priority}
                    onLoadingComplete={(res) => {
                        if (res.naturalWidth === 0)
                            setImgSrc(fallback);
                    }}
                    onError={() => {
                        setImgSrc(fallback);
                    }}
                />
            )}
        </>
    )
}