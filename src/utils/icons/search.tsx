const Search: React.FC<{
    classes?: string[]
}> = ({
    classes
}) => {
    return (
        <svg aria-hidden="true" className={classes ? classes.join(" ") : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>  
    );
}

export default Search;