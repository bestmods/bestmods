import FilterIcon from "@components/icons/filter"
import GridIcon from "@components/icons/grid"
import SearchIcon from "@components/icons/search"
import TableIcon from "@components/icons/table"
import { setCookie } from "cookies-next"
import { Dispatch, SetStateAction, useState } from "react"

export default function ModBrowserFilters ({
    setTimeframe,
    setSort,
    setSearch,

    display,
    setDisplay
} : {
    setTimeframe: Dispatch<SetStateAction<number>> 
    setSort: Dispatch<SetStateAction<number>>
    setSearch: Dispatch<SetStateAction<string | undefined>>

    display: string
    setDisplay: Dispatch<SetStateAction<string>>
}) {
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <form className="mod-filters flex flex-wrap justify-end gap-2">
            <div className={`z-10 bg-cyan-800 absolute top-0 left-0 w-1/3 p-6 h-full${!filtersOpen ? ` hidden`: ``}`}>
                <h2>General</h2>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <label>Time Frame</label>
                        <select
                            className=""
                            onChange={(e) => {
                                const val = e.target.value;

                                setTimeframe(Number(val));
                            }}
                        >
                            <option value="0">Hourly</option>
                            <option value="1">Today</option>
                            <option value="2">Week</option>
                            <option value="3">Month</option>
                            <option value="4">Year</option>
                            <option value="5">All Time</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label>Sort</label>
                        <select
                            className=""
                            onChange={(e) => {
                                e.preventDefault();

                                const val = e.target.value;

                                setSort(Number(val));
                            }}
                        >
                            <option value="0">Top Rated</option>
                            <option value="1">Most Viewed</option>
                            <option value="2">Most Downloaded</option>
                            <option value="3">Most Recently Updated</option>
                            <option value="4">Most Recently Created</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative w-full sm:w-[32rem]">
                    <input
                        className="w-full pr-10 bg-bestmods-1/80 p-2 rounded-md focus:ring-2 focus:ring-bestmods-2/80 text-gray-50"
                        type="text"
                        placeholder="Search for your favorite mods!"
                        onChange={(e) => {
                            e.preventDefault();

                            const val = e.target.value;

                            setSearch(val);
                        }}
                    />
                    <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
                        <SearchIcon
                            className="w-5 h-5"
                        />
                    </div>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.preventDefault();

                        setFiltersOpen(!filtersOpen);
                    }}
                >
                    <FilterIcon className="w-6 h-6 stroke-white" />
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.preventDefault();

                        const newDisplay = display == "grid" ? "table" : "grid";

                        setDisplay(newDisplay);
                        setCookie("bm_display", newDisplay);
                    }}
                >
                    {display == "grid" ? (
                        <TableIcon className="w-6 h-6 stroke-white fill-white" />
                    ) : (
                        <GridIcon className="w-6 h-6 stroke-white" />
                    )}
                </button>
            </div>
        </form>
    )
}