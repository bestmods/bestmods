import Image from "next/image"

export default function IconAndText({
    icon,
    text,
    width = 32,
    height = 32,
    imgClassName,
    alt = "Icon",
    className = "flex flex-wrap gap-1 items-center"
} : {
    icon: string | JSX.Element
    text: JSX.Element
    width?: number
    height?: number
    imgClassName?: string
    alt?: string
    className?: string
}) {
    return (
        <div className={className}>
            <div>
                {typeof icon == "string" && (
                    <Image
                        src={icon}
                        width={width}
                        height={height}
                        alt={alt}
                        className={imgClassName}
                    />
                )}
                {typeof icon != "string" && (
                    <>
                        {icon}
                    </>
                )}
            </div>
            <div>
                {text}
            </div>
        </div>
    )
}