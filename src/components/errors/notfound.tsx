import Link from "next/link";

export default function NotFound ({
    item = "page"
} : {
    item?: string
}) {
    const itemName = item.charAt(0).toLowerCase() + item.slice(1);
    
    return (
        <div className="flex flex-col gap-2">
            <h2>Not Found!</h2>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>The {itemName} you{"'"}ve requested was not found! It{"'"}s possible the {item} was removed from our database or the URL is incorrect.</p>
                <p>Discover mods <Link href="https://bestmods.org/browse">here</Link>!</p>
            </div>
        </div>
    )
}