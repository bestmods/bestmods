const Download: React.FC<{
    classes?: string
}> = ({
    classes
}) => {
    return (
        <svg className={classes ? classes : ""} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11L12 15M12 15L8 11M12 15V3M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default Download;