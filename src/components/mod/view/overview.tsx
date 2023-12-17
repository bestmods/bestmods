import Markdown from "@components/markdown/markdown";
import { type ModViewItem } from "~/types/mod";

export default function ModViewOverview({
    mod
} : {
    mod: ModViewItem
}) {
    return (
        <Markdown rehype={true}>
            {mod.description}
        </Markdown>
    )
}