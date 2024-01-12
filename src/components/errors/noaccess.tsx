export default function NoAccess() {
    return (
        <div className="flex flex-col gap-2">
            <h1>No Permissions!</h1>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>You do not have access to view this page. If this is a mistake, please contact an administrator.</p>
            </div>
        </div>
    )
}