import Image from "next/image"

export default function IconAndText({
    icon,
    text,
    width = 32,
    height = 32,
    alt = "Icon"
} : {
    icon: string | JSX.Element
    text: JSX.Element
    width?: number
    height?: number
    alt?: string
}) {
    return (
        <div className="flex flex-wrap gap-1 items-center">
            <div>
                {typeof icon == "string" && (
                    <Image
                        src={icon}
                        width={width}
                        height={height}
                        alt={alt}
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