export default function NotFound ({
    item = "This"
} : {
    item?: string
}) {
    return (
        <div>
            <p>{item.charAt(0).toUpperCase() + item.slice(1)} was not found! Please check the URL and make sure it is correct.</p>
        </div>
    )
}