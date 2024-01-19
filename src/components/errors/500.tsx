export default function Error500 () {
    return (
        <div className="flex flex-col gap-2">
            <h2>Server-Side Error</h2>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>The request has encountered a 500 server-side error. If you continue to see this page, please reach out to us!</p>
            </div>
        </div>
    )
}