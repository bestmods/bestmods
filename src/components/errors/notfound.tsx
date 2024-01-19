export default function NotFound ({
    item = "page"
} : {
    item?: string
}) {
    return (
        <div className="flex flex-col gap-2">
            <h2>Not Found!</h2>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>The {item.charAt(0).toLowerCase() + item.slice(1)} you{"'"}ve requested was not found! Please check the URL and make sure it is correct.</p>
            </div>
        </div>
    )
}