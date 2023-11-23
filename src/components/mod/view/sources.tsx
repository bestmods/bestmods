import Image from "next/image";
import { type ModViewItem } from "~/types/mod";

export default function ModViewSources ({
    mod
} : {
    mod: ModViewItem
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    return (
        <>
            <h3>Sources</h3>
            {mod.ModSource != null && mod.ModSource.length > 0 && (
                <div id="mod-sources">
                    {mod.ModSource.map((src) => {
                        const name = src.source.name;
                        let banner = src.source.banner ? src.source.banner : "/images/default_source_banner.png";

                        if (cdn)
                            banner = cdn + banner;

                        const srcLink = "https://" + src.sourceUrl + "/" + src.query;

                        return (
                            <a rel="noreferrer" key={"src-" + src.modId + "-" + src.sourceUrl + "-" + src.query} href={srcLink} target="_blank" className="mod-source-item">
                                <div>
                                    <div className="mod-source-item-image">
                                        <Image
                                            src={banner}
                                            width={720}
                                            height={320}
                                            alt="Source Banner"
                                        />
                                    </div>
                                    <div className="mod-source-item-name">
                                        <h3>{name}</h3>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </>
    )
}