import { type ModViewItem } from "~/types/mod";

export default function ModViewCredits ({
    mod
} : {
    mod: ModViewItem
}) {
    return (
        <div className="flex flex-col gap-2">
            <h2>Credits</h2>
            {mod.ModCredit.length > 0 ? (
                <ul className="px-6 flex flex-col gap-4 list-disc">
                    {mod.ModCredit.map(({ name, credit } : { name: string, credit: string }, index) => {
                        return (
                            <li
                                key={`credit-${index.toString()}`}
                            >
                                <span className="font-bold">{name}</span> - <span>{credit}</span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No credits found.</p>
            )}
        </div>
    )
}