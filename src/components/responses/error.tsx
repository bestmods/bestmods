export default function Error ({
    title,
    msg
} : {
    title: string
    msg: string
}) {
    return (
        <div className="error">
            <h2>{title}</h2>
            <p>{msg}</p>
        </div>
    )
}