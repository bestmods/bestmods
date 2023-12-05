import IconAndText from "@components/icon_and_text"
import FilterIcon from "@components/icons/filter"
import GridIcon from "@components/icons/grid"
import SearchIcon from "@components/icons/search"
import TableIcon from "@components/icons/table"
import Loading from "@components/loading"
import { trpc } from "@utils/trpc"
import { setCookie } from "cookies-next"
import { Dispatch, SetStateAction, useState } from "react"
import InfiniteScroll from "react-infinite-scroller"
import { CategoryWithChildren } from "~/types/category"

export default function ModBrowserFilters ({
    setTimeframe,
    setSort,
    setSearch,

    categories = [],
    setCategories,

    display,
    setDisplay
} : {
    setTimeframe: Dispatch<SetStateAction<number>> 
    setSort: Dispatch<SetStateAction<number>>
    setSearch: Dispatch<SetStateAction<string | undefined>>

    categories: number[]
    setCategories: Dispatch<SetStateAction<number[]>>

    display: string
    setDisplay: Dispatch<SetStateAction<string>>
}) {
    const [filtersOpen, setFiltersOpen] = useState(false); 

    return (
        <form className="flex flex-wrap justify-end gap-2">
            <div className={`z-10 bg-cyan-800 absolute top-0 left-0 w-1/3 p-6 h-full overflow-y-scroll${!filtersOpen ? ` hidden`: ``}`}>
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
                <h2>Categories</h2>
                <div>
                    <Categories
                        categories={categories}
                        setCategories={setCategories}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative grow">
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

function Categories ({
    categories,
    setCategories
} : {
    categories: number[]
    setCategories: Dispatch<SetStateAction<number[]>>
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    // Retrieve categories.
    const [needMoreCats, setNeedMoreCats] = useState(true);

    const allCats: CategoryWithChildren[] = [];

    const { data, fetchNextPage } = trpc.category.getCategoryMappings.useInfiniteQuery({}, {
        getNextPageParam: (lastPage) => lastPage.nextCat
    })

    const loadMore = async() => {
        await fetchNextPage();
    }

    if (data) {
        data.pages.forEach((pg) => {
            allCats.push(...pg.categories);

            if (!pg.nextCat && needMoreCats)
                setNeedMoreCats(false);
        })
    }

    const catsOrLoading = !data || allCats.length > 0;

    return (
        <InfiniteScroll
            pageStart={0}
            className="flex flex-col gap-2"
            loadMore={loadMore}
            hasMore={needMoreCats}
            loader={<Loading key="loader" />}
        >
            {catsOrLoading ? (
                <>
                    {allCats.map((cat, index) => {
                        let icon = "/images/default_icon.png";

                        if (cat.icon)
                            icon = cdn + cat.icon;

                        const isSelected = categories.length < 1 || categories.includes(cat.id);
                    
                        return (
                            <div
                                key={`category-${index.toString()}`}
                            >
                                <button
                                    className={!isSelected ? `opacity-60` : undefined}
                                    onClick={(e) => {
                                        e.preventDefault();

                                        let newCats = [...categories];

                                        const loc = newCats.findIndex(tmp => tmp == cat.id);

                                        if (loc !== -1)
                                            newCats.splice(loc, 1);
                                        else
                                            newCats.push(cat.id);

                                        setCategories(newCats);
                                    }}
                                >
                                    <IconAndText
                                        icon={icon}
                                        text={<>{cat.name}</>}
                                    />
                                </button>

                                {cat.children.length > 0 && (
                                    <ul className="flex flex-col gap-1">
                                        {cat.children.map((child, index) => {
                                            let icon = "/images/default_icon.png";

                                            if (child.icon)
                                                icon = cdn + child.icon;

                                            const isSelected = categories.length < 1 || categories.includes(child.id);

                                            return (
                                                <li
                                                    key={`child-${index.toString()}`}
                                                    className={`${!isSelected ? `opacity-60 ` : ``}ml-10 cursor-pointer`}
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        let newCats = [...categories];

                                                        const loc = newCats.findIndex(tmp => tmp == child.id);

                                                        if (loc !== -1)
                                                            newCats.splice(loc, 1);
                                                        else
                                                            newCats.push(child.id);

                                                        setCategories(newCats);
                                                    }}
                                                >
                                                    <IconAndText
                                                        icon={icon}
                                                        text={<>{child.name}</>}
                                                    />
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        )
                    })}
                </>
            ) : (
                <p>No categories found...</p>
            )}
        </InfiniteScroll>
    )
}