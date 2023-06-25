import { useContext } from "react";
import { DisplayCtx, FilterCtx } from "../../main";
import { Field, Form, Formik } from "formik";
import Link from "next/link";

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
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <Field type="search" name="search" value={filters?.search ?? ""} onChange={filters?.searchCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?search=" + e.target.value;
                    })} className="header-filter-input header-filter-input-search" placeholder="Search for your favorite mods!" />
                </div>
                <div className="header-filter-button">
                    <Link href="/category">
                        <div>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11052)"><circle cx="17" cy="7" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7" cy="17" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 14H20V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V14Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 4H10V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V4Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11052"><rect width="24" height="24" fill="white" /></clipPath></defs></svg>
                        </div>
                    </Link>
                </div>
                <div className="header-filter-button">
                    <button onClick={display?.displayCb}>
                        <div>
                            {display?.display == "grid" ? (
                                <svg fill="#FFFFFF" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><path d="M1740 0c99.24 0 180 80.76 180 180v1560c0 99.24-80.76 180-180 180H180c-99.24 0-180-80.76-180-180V180C0 80.76 80.76 0 180 0h1560Zm-420 1200h480V720h-480v480Zm480 540v-420h-480v480h420c33 0 60-27 60-60ZM720 1200h480V720H720v480Zm0 600h480v-480H720v480Zm-600-600h480V720H120v480Zm480 600v-480H120v420c0 33 27 60 60 60h420Z" fillRule="evenodd" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="none" /><path d="M2 8.976C2 7.72287 2.06584 6.64762 2.26552 5.74916C2.46772 4.83933 2.82021 4.05065 3.43543 3.43543C4.05065 2.82021 4.83933 2.46772 5.74915 2.26552C6.64762 2.06584 7.72287 2 8.976 2L9 2C10.1046 2 11 2.89543 11 4L11 9C11 10.1046 10.1046 11 9 11L4 11C2.89543 11 2 10.1046 2 9L2 8.976Z" fill="#FFFFFF" /><path d="M22 15.024C22 16.2771 21.9342 17.3524 21.7345 18.2508C21.5323 19.1607 21.1798 19.9494 20.5646 20.5646C19.9494 21.1798 19.1607 21.5323 18.2508 21.7345C17.3524 21.9342 16.2771 22 15.024 22L15 22C13.8954 22 13 21.1046 13 20L13 15C13 13.8954 13.8954 13 15 13L20 13C21.1046 13 22 13.8954 22 15L22 15.024Z" fill="#FFFFFF" /><path d="M2 15.024C2 16.2771 2.06584 17.3524 2.26552 18.2508C2.46772 19.1607 2.82021 19.9494 3.43543 20.5646C4.05065 21.1798 4.83933 21.5323 5.74915 21.7345C6.64762 21.9342 7.72287 22 8.976 22L9 22C10.1046 22 11 21.1046 11 20L11 15C11 13.8954 10.1046 13 9 13L4 13C2.89543 13 2 13.8954 2 15L2 15.024Z" fill="#FFFFFF" /><path d="M22 8.976C22 7.72287 21.9342 6.64762 21.7345 5.74916C21.5323 4.83933 21.1798 4.05065 20.5646 3.43543C19.9494 2.82021 19.1607 2.46772 18.2508 2.26552C17.3524 2.06584 16.2771 2 15.024 2L15 2C13.8954 2 13 2.89543 13 4L13 9C13 10.1046 13.8954 11 15 11L20 11C21.1046 11 22 10.1046 22 9L22 8.976Z" fill="#FFFFFF" /></svg>
                            )}
                        </div>
                    </button>
                </div>
            </Form>
        </Formik>
    );
};

export default Filters;