export default function Success ({
    title,
    msg
} : {
    title: string
    msg: string
}) {
    return (
        <div className="success">
            <h2>{title}</h2>
            <p>{msg}</p>
        </div>
    )
}