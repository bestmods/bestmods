const DownArrow: React.FC<{
    classes?: string
}> = ({
    classes
}) => {
    return (
        <svg className={classes ? classes : ""} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_429_11251)">
                <path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_429_11251">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

export default DownArrow;