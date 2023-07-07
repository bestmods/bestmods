import Link from "next/link";

export const NavItems: React.FC<{
    classes?: string
}> = ({
    classes
}) => {
    return (
        <>
            <Link className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/categories/feedback-ideas" target="_blank">Feedback</Link>
            <Link className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/bestmods/bestmods/milestones" target="_blank">Roadmap</Link>
            <Link className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/BestMods/bestmods" target="_blank">Source Code</Link>
            <Link className={classes ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/35" target="_blank">Removals</Link>
            <Link className={classes ? classes : "text-gray-300 hover:text-white"} href="https://moddingcommunity.com/" target="_blank">Community</Link>
        </>
    );
};

export default NavItems;