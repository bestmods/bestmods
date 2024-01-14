import Link from "next/link";

export default function ModReportButton ({
    modId
} : {
    modId: number
}) {
    return (
        <Link
            href={`/report/mod/${modId.toString()}`}
            className="btn btn-danger"
        >Report</Link>
    )
}