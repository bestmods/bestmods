import { ViewPortCtx } from "@components/main";
import { GetSourceBanner } from "@utils/source";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { type ModViewItem } from "~/types/mod";

export default function ModViewSources ({
    mod
} : {
    mod: ModViewItem
}) {
    const viewPort = useContext(ViewPortCtx);

    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    return (
        <div className="flex flex-col gap-2">
            <h2>Sources</h2>
            {mod.ModSource && mod.ModSource.length > 0 && (
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 320px))"
                    }}    
                >
                    {mod.ModSource.map((src, index) => {
                        const name = src.source.name;
                        const banner = GetSourceBanner(src.source, cdn);

                        // Get query link.
                        let query = src.query.trim();

                        if (!query.startsWith("/"))
                            query = `/${query}`;

                        const srcLink = `https://${src.sourceUrl}${query}`;

                        return (
                            <Link
                                rel="noreferrer"
                                key={`source-${index.toString()}`}
                                href={srcLink}
                                target="_blank"
                                className="max-w-96 bg-bestmods-3/80 rounded group relative ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80"
                            >
                                <div className="w-full h-full relative">
                                    <Image
                                        src={banner}
                                        width={720}
                                        height={320}
                                        alt="Source Banner"
                                        className="w-full h-full max-w-full max-h-full brightness-50 group-hover:brightness-[80%] group-hover:duration-300"
                                    />
                                    <h3 className={`absolute bottom-2 left-2${viewPort.isMobile ? " text-lg" : ""}`}>{name}</h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    )
}