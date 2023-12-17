import IconAndText from "@components/icon_and_text";
import Download2 from "@components/icons/download2";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import { type ModViewItem } from "~/types/mod";

export default function ModViewDownloads ({
    mod
} : {
    mod: ModViewItem
}) {
    const modDownloadMut = trpc.modDownload.incCnt.useMutation();

    const downloads = mod.ModDownload ?? [];

    const dlCnt = mod.totalDownloads ?? 0;

    return (
        <div className="flex flex-col gap-2">
            <h2>Downloads</h2>
            {downloads.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-4">
                        {downloads.map((dl, index) => {
                            return (
                                <Link
                                    key={`download-${index.toString()}`}
                                    onClick={() => {
                                        modDownloadMut.mutate({
                                            url: mod.url
                                        });
                                    }}
                                    className="p-4 bg-bestmods-3/80 hover:bg-bestmods-4/80 rounded text-white visited:text-white active:text-white hover:text-white"
                                    href={dl.url}
                                    target="_blank"
                                >
                                    <IconAndText
                                        icon={<Download2 className="w-6 h-6 stroke-white" />}
                                        text={<span>{dl.name}</span>}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                    <p className="mod-downloads-total">{dlCnt.toString()} Total Downloads</p>
                </div>
            ) : (
                <p>There are no downloads available.</p>
            )}
        </div>
    )
}