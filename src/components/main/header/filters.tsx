import { useContext } from "react";
import { DisplayCtx, FilterCtx } from "../../main";
import { Field, Form, Formik } from "formik";
import Link from "next/link";

import SearchIcon from '../../utils/icons/search';
import CategoryIcon from '../../utils/icons/category';

import TableIcon from '../../utils/icons/table';
import GridIcon from '../../utils/icons/grid';

const Filters: React.FC<{
    classes?: string
}> = ({
    classes
}) => {
    const filters = useContext(FilterCtx);
    const display = useContext(DisplayCtx);

    return (
        <Formik
            initialValues={{
                search: ""
            }}
            onSubmit={(e) => {
                history.pushState(null, "", `?search=${e.search}`);
            }}
        >
            <Form className={`header-filters ${classes ?? ""}`}>
                <div className="header-filter-timeframe">
                    <select name="filterTimeframe" value={filters?.timeframe?.toString() ?? ""} onChange={filters?.timeframeCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?timeframe=" + e.target.value;
                    })} className="header-filter-input">
                        <option value="0">Hourly</option>
                        <option value="1">Today</option>
                        <option value="2">Week</option>
                        <option value="3">Month</option>
                        <option value="4">Year</option>
                        <option value="5">All Time</option>
                    </select>
                </div>
                <div className="header-filter-sort">
                    <select name="filterSort" value={filters?.sort?.toString() ?? ""} onChange={filters?.sortCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?sort=" + e.target.value;
                    })} className="header-filter-input">
                        <option value="0">Top Rated</option>
                        <option value="1">Most Viewed</option>
                        <option value="2">Most Downloaded</option>
                        <option value="3">Most Recently Updated</option>
                        <option value="4">Most Recently Created</option>
                    </select>
                </div>
                <div className="header-filter-search">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <SearchIcon
                            classes={["w-5", "h-5", "text-gray-400"]}
                        />
                    </div>

                    <Field type="search" name="search" value={filters?.search ?? ""} onChange={filters?.searchCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?search=" + e.target.value;
                    })} className="header-filter-input header-filter-input-search" placeholder="Search for your favorite mods!" />
                </div>
                <div className="header-filter-button">
                    <Link href="/category">
                        <div>
                            <CategoryIcon />
                        </div>
                    </Link>
                </div>
                <div className="header-filter-button">
                    <button onClick={display?.displayCb}>
                        <div>
                            {display?.display == "grid" ? (
                                <GridIcon />
                            ) : (
                                <TableIcon />
                            )}
                        </div>
                    </button>
                </div>
            </Form>
        </Formik>
    );
};

export default Filters;