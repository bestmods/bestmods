export default function Error ({
    title,
    msg
} : {
    title: string
    msg: string
}) {
    return (
        <div className="p-4 bg-red-500/80">
            <h2>{title}</h2>
            <p>{msg}</p>
        </div>
    )
}