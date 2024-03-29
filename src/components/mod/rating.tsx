import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

import { trpc } from "@utils/trpc";

import DownArrow2 from "@components/icons/down_arrow2";
import UpArrow2 from "@components/icons/up_arrow2";
import { type ModRowBrowser, type ModViewItem } from "~/types/mod";

export default function ModRating ({
    mod,
    rating,
    className = "relative flex gap-1 text-center justify-center items-center",
    invert = false
} : {
    mod: ModRowBrowser | ModViewItem
    rating?: number
    className?: string
    invert?: boolean
}) {
    // This stores a temporary rating value for when the user submits a rating.
    const [displayRating, setDisplayRating] = useState(Number(mod.rating ?? rating ?? 1));

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve rating.
    const cur_rating = mod.ModRating?.[0] ?? null;

    // Controls whether user rated this mod or not.
    const [didRate, setDidRate] = useState(false);
    const [rateIsPositive, setRateIsPositive] = useState(false);

    if (cur_rating && !didRate) {
        if (cur_rating.positive)
            setRateIsPositive(true);

        setDidRate(true);
    }

    const myRatingMut = trpc.modRating.add.useMutation();

    // Buttons.
    const upvote = <div>
        <button onClick={(e) => {
            e.preventDefault();

            // Submit positive rating.
            if (session?.user) {
                if (didRate && rateIsPositive)
                    return;

                myRatingMut.mutate({
                    userId: session.user.id,
                    modId: mod.id,
                    positive: true
                });

                // Set temporary rating value.
                setDisplayRating(prev => prev + 1);

                setDidRate(true);
                setRateIsPositive(true);
            } else if (!session?.user)
                signIn("discord");
        }}>
            <UpArrow2
                className={`w-12 h-12 text-center${(didRate && !rateIsPositive) ? ` opacity-20` : ``}`}
            />
        </button>
    </div>

    const downvote = <div>
        <button onClick={(e) => {
            e.preventDefault();

            // Submit negative rating.
            if (session?.user) {
                if (didRate && !rateIsPositive)
                    return;

                myRatingMut.mutate({
                    userId: session.user.id,
                    modId: mod.id,
                    positive: false
                });

                // Set temporary rating value.
                setDisplayRating(prev => prev - 1);

                setDidRate(true);
                setRateIsPositive(false);
            } else if (session?.user == null)
                signIn("discord");
        }}>
            <DownArrow2
                className={`w-12 h-12 text-center${(didRate && rateIsPositive) ? ` opacity-20` : ``}`}
            />
        </button>
    </div>

    return (
        <div className={className}>
            {invert ? (
                <>{upvote}</>
            ) : (
                <>{downvote}</>
            )}
            <div>
                <span className="text-white font-bold text-4xl text-center">{displayRating?.toString() ?? rating?.toString() ?? 1}</span>
            </div>
            {invert ? (
                <>{downvote}</>
            ) : (
                <>{upvote}</>
            )}
        </div>
    )
}

