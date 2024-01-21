import LoadingIcon from "./icons/loading"

export default function Loading () {
    return (
        <div className="flex gap-1">
            <LoadingIcon
                className={"w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"}
            />
            <h5>Loading...</h5>
        </div>
    )
}