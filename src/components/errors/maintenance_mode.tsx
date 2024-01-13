import Link from "next/link";

export default function MaintenanceMode () {
    return (
        <div className="flex flex-col gap-2">
            <h1>Down For Maintenance</h1>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>We are currently down for maintenance! We will be back up as soon as possible.</p>
                <p>Please follow <Link href="https://x.com/bestmodsio" target="_blank">@bestmodsio</Link> on Twitter/X for updates!</p>
            </div>
        </div>
    )
}