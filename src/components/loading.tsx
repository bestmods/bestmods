import LoadingIcon from "./icons/loading"

export default function Loading ({
    className = "text-center text-white"
} : {
    className?: string
}) {
    return (
        <div className={className}>
            <LoadingIcon
                className={"w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"}
            />
            <h3>Loading...</h3>
        </div>
    )
}