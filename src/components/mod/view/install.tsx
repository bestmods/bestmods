import Markdown from "@components/markdown/markdown";
import { type ModViewItem } from "~/types/mod";

export default function ModViewInstall ({
    mod
} : {
    mod: ModViewItem
}) {
    return (
        <>
            {mod.install ? (
                <Markdown rehype={true}>
                    {mod.install}
                </Markdown>
            ) : (
                <p>No installation guide found.</p>
            )}
        </>
    )
}