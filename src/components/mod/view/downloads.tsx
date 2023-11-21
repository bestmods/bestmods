import Download2 from "@components/icons/download2";
import { trpc } from "@utils/trpc";
import { type ModViewItem } from "~/types/mod";

export default function ModViewDownloads ({
    mod
} : {
    mod: ModViewItem
}) {
    const modDownloadMut = trpc.modDownload.incModDownloadCnt.useMutation();

    const downloads = mod.ModDownload ?? [];

    const dlCnt = mod.totalDownloads ?? 0;

    return (
        <>
            <h3>Downloads</h3>
            {downloads.length > 0 ? (
                <div>
                    <div id="mod-downloads">
                        {downloads.map((dl) => {
                            return (
                                <a
                                    rel="noreferrer"
                                    key={`mod-dl-${dl.url}`}
                                    onClick={() => {
                                        modDownloadMut.mutate({
                                            url: mod.url
                                        });
                                    }}
                                    className="mod-download-item"
                                    href={dl.url}
                                    target="_blank"
                                >
                                    <div key={dl.modId + dl.url}>
                                        <Download2
                                            className={"w-5 h-5"}
                                        />
                                        <span>{dl.name}</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                    <p className="mod-downloads-total">{dlCnt.toString()} Total Downloads</p>
                </div>
            ) : (
                <p>There are no downloads available.</p>
            )}
        </>
    )
}