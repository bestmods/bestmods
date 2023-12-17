export default function Success ({
    title,
    msg
} : {
    title: string
    msg: string
}) {
    return (
        <div className="p-4 bg-lime-700/80 rounded text-white">
            <h2>{title}</h2>
            <p>{msg}</p>
        </div>
    )
}