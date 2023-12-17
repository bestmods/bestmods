import Image from "next/image";
import Link from "next/link";
import { type ModViewItem } from "~/types/mod";

export default function ModViewSources ({
    mod
} : {
    mod: ModViewItem
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    return (
        <div className="flex flex-col gap-2">
            <h2>Sources</h2>
            {mod.ModSource != null && mod.ModSource.length > 0 && (
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))"
                    }}    
                >
                    {mod.ModSource.map((src, index) => {
                        const name = src.source.name;
                        let banner = src.source.banner ? src.source.banner : "/images/default_source_banner.png";

                        if (cdn)
                            banner = cdn + banner;

                        const srcLink = "https://" + src.sourceUrl + "/" + src.query;

                        return (
                            <Link
                                rel="noreferrer"
                                key={`source-${index.toString()}`}
                                href={srcLink}
                                target="_blank"
                                className="bg-bestmods-3/80 rounded group relative ring-4 ring-bestmods-3/80 hover:ring-bestmods-4/80"
                            >
                                <div className="w-full h-full relative">
                                    <Image
                                        src={banner}
                                        width={720}
                                        height={320}
                                        alt="Source Banner"
                                        className="h-full w-full brightness-50 group-hover:brightness-[80%] group-hover:duration-300"
                                    />
                                    <h3 className="absolute bottom-2 left-2">{name}</h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    )
}