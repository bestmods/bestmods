import { type ModViewItem } from "~/types/mod";

export default function ModViewCredits ({
    mod
} : {
    mod: ModViewItem
}) {
    return (
        <>
            <h3>Credits</h3>
            {mod.ModCredit.length > 0 ? (
                <div id="mod-credits">
                    <ul>
                        {mod.ModCredit.map(({ name, credit } : { name: string, credit: string }) => {
                            if (!name || !credit)
                                return;

                            return (
                                <li key={`credit-${name}`}>
                                    <span className="mod-credit-name">{name}</span> - <span className="mod-credit-credit">{credit}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <p>No credits found.</p>
            )}
        </>
    )
}