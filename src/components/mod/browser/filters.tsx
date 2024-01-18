import IconAndText from "@components/icon_and_text"
import FilterIcon from "@components/icons/filter"
import GridIcon from "@components/icons/grid"
import LeftArrowIcon from "@components/icons/left_arrow"
import SearchIcon from "@components/icons/search"
import TableIcon from "@components/icons/table"
import Loading from "@components/loading"
import { ViewPortCtx } from "@components/main"
import { GetCategoryIcon } from "@utils/category"
import { trpc } from "@utils/trpc"
import { type Dispatch, type SetStateAction, useState, useEffect, useRef, useContext } from "react"
import { useCookies } from "react-cookie"
import InfiniteScroll from "react-infinite-scroller"
import { type CategoryWithChildren } from "~/types/category"

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
    // Figure out if this is our first render.
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;
    }, [firstRender])

    const isFirstRender = firstRender.current;

    // Handle filters menu.
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filtersMenu = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ele = filtersMenu.current;

        if (!ele)
            return;

        if (filtersOpen) {
            ele.classList.remove("hidden");
            ele.classList.remove("animate-menu-right-to-left");

            ele.classList.add("flex");
            ele.classList.add("animate-menu-left-to-right");
        } else if (!isFirstRender) {
            ele.classList.remove("animate-menu-left-to-right");
            ele.classList.add("animate-menu-right-to-left");
        }

        const onAnimateEnd = (e: AnimationEvent) => {
            if (e.animationName == "menu-right-to-left") {
                ele.classList.remove("flex");
                ele.classList.add("hidden");
            }
        }

        ele.addEventListener("animationend", onAnimateEnd, {
            once: true
        });

        return () => {
            ele.removeEventListener("animationend", onAnimateEnd)
        }
    }, [filtersOpen, isFirstRender])

    const [, setCookie] = useCookies(["bm_display"]);

    return (
        <div className="flex flex-wrap justify-end gap-2">
            <div ref={filtersMenu} className={`hidden z-50 fixed top-0 left-0 w-1/2 p-6 h-full bg-bestmods-2 overflow-auto justify-between`}>
                <div className="grow flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <h2>Filters</h2>
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
                    <Categories
                        categories={categories}
                        setCategories={setCategories}
                        parentNode={filtersMenu.current}
                    />
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();

                            setFiltersOpen(!filtersOpen);
                        }}
                    >
                        <LeftArrowIcon className="w-6 h-6 stroke-white" />
                    </button>
                </div>
            </div>
            <div className="flex w-full md:w-3/5 xl:w-1/3 flex-wrap gap-2 items-center">
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
        </div>
    )
}

function Categories ({
    categories,
    setCategories,
    parentNode
} : {
    categories: number[]
    setCategories: Dispatch<SetStateAction<number[]>>
    parentNode: HTMLDivElement | null
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const viewPort = useContext(ViewPortCtx);

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
            useWindow={false}
            getScrollParent={() => parentNode}
        >
            {catsOrLoading && (
                <>
                    <h3>Categories</h3>
                    {allCats.map((cat, index) => {
                        const icon = GetCategoryIcon(cat, cdn);

                        const isSelected = categories.length < 1 || categories.includes(cat.id);
                    
                        return (
                            <div
                                key={`category-${index.toString()}`}
                            >
                                <button
                                    className={!isSelected ? `opacity-60` : undefined}
                                    onClick={(e) => {
                                        e.preventDefault();

                                        const newCats = [...categories];

                                        const loc = newCats.findIndex(tmp => tmp == cat.id);

                                        if (loc !== -1)
                                            newCats.splice(loc, 1);
                                        else
                                            newCats.push(cat.id);

                                        setCategories(newCats);
                                    }}
                                >
                                    {viewPort.isMobile ? (
                                        <span>{cat.name}</span>
                                    ) : (
                                        <IconAndText
                                            icon={icon}
                                            text={<span>{cat.name}</span>}
                                        />
                                    )}
                                </button>

                                {cat.children.length > 0 && (
                                    <ul className="flex flex-col gap-1">
                                        {cat.children.map((child, index) => {
                                            const icon = GetCategoryIcon(child, cdn);

                                            const isSelected = categories.length < 1 || categories.includes(child.id);

                                            return (
                                                <li
                                                    key={`child-${index.toString()}`}
                                                    className={`${!isSelected ? `opacity-60 ` : ``}ml-6 cursor-pointer`}
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        const newCats = [...categories];

                                                        const loc = newCats.findIndex(tmp => tmp == child.id);

                                                        if (loc !== -1)
                                                            newCats.splice(loc, 1);
                                                        else
                                                            newCats.push(child.id);

                                                        setCategories(newCats);
                                                    }}
                                                >
                                                    {viewPort.isMobile ? (
                                                        <span>{child.name}</span>
                                                    ) : (
                                                        <IconAndText
                                                            icon={icon}
                                                            text={<span>{child.name}</span>}
                                                        />
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        )
                    })}
                </>
            )}
        </InfiniteScroll>
    )
}