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
                    <table className="table table-auto w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Size</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {downloads.map((dl, index) => {
                                // Get upload date if any.
                                let uploadDate: string | null = null;

                                if (dl.uploadDate) {
                                    const dateOptions: Intl.DateTimeFormatOptions = {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                      };
                            
                                      const formatter = new Intl.DateTimeFormat('en-US', dateOptions);

                                      uploadDate = formatter.format(new Date(dl.uploadDate))
                                }

                                return (
                                    <tr key={`download-${index.toString()}`}>
                                        <td>
                                            <IconAndText
                                                icon={
                                                    <Download2 className="w-4 h-4 stroke-white" />
                                                }
                                                text={
                                                    <Link
                                                        key={`download-${index.toString()}`}
                                                        onClick={() => {
                                                            modDownloadMut.mutate({
                                                                id: mod.id
                                                            });
                                                        }}
                                                        href={dl.url}
                                                        target="_blank"
                                                    >
                                                        <span>{dl.name}</span>
                                                    </Link>
                                                }
                                            />
                                        </td>
                                        <td>
                                            {dl.size ? (
                                                <span>{dl.size} MBs</span>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {uploadDate ? (
                                                <span>{uploadDate}</span>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <p className="mod-downloads-total">{dlCnt.toString()} Total Downloads</p>
                </div>
            ) : (
                <p>There are no downloads available.</p>
            )}
        </div>
    )
}