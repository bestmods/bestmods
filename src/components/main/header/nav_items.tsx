export const NavItems: React.FC<{
    classes?: string | null
}> = ({
    classes
}) => {
    return (
        <>
            <a rel="noreferrer" className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/categories/feedback-ideas" target="_blank">Feedback</a>
            <a rel="noreferrer" className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/bestmods/roadmap/milestones" target="_blank">Roadmap</a>
            <a rel="noreferrer" className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/BestMods/bestmods" target="_blank">Source Code</a>
            <a rel="noreferrer" className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/2" target="_blank">Removals</a>
            <a rel="noreferrer" className={classes ? classes : "text-gray-300 hover:text-white"} href="https://moddingcommunity.com/" target="_blank">Community</a>
        </>
    );
};

export default NavItems;