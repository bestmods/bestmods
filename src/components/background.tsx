export default function Background ({
    background = "bg-gradient-to-b from-[#002736] to-[#00151b]",
    image = null,
    overlay = true 
}: {
    background?: string,
    image?: string | null,
    overlay?: boolean | string
}) {
    return (<>
        {overlay && (
            <div id="bgol" className={typeof (overlay) === "string" ? overlay : "bg-black/80"}></div>
        )}

        <div id="bg" className={background}>
            {image && (
                <img src={image} className="hidden md:block w-full h-full" alt="background" />
            )}
        </div>
    </>)
}