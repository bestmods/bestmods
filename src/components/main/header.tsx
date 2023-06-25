import Link from "next/link";
import NavItems from "./header/nav_items";
import Filters from "./header/filters";

const Header: React.FC<{
    showFilters?: boolean
}> = ({
    showFilters = false
}) => {
    return (
        <header>
            <h1>
                <Link href="/"><span className="text-blue-400">B</span>est{" "}
                    <span className="text-blue-400">M</span>ods</Link>
            </h1>
            <nav>
                <NavItems />
            </nav>
            {showFilters && (
                <Filters />
            )}
        </header>
    );
};

export default Header;