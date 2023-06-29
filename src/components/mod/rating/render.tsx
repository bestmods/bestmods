import { signIn, useSession } from "next-auth/react";
import { FilterCtx } from "../../main";
import { useContext, useState } from "react";
import { trpc } from "../../../utils/trpc";
import DownArrow2 from "../../utils/icons/down_arrow2";
import UpArrow2 from "../../utils/icons/up_arrow2";

const RatingRender: React.FC<{
    mod: any,
    classes?: string[]
}> = ({
    mod,
    classes
}) => {
    // Retrieve session.
    const { data: session } = useSession();
    const filters = useContext(FilterCtx);

    // Retrieve rating.
    const cur_rating = mod.ModRating[0] ?? null;

    const [rating, setRating] = useState(1);
    const [receivedRating, setReceivedRating] = useState(false);

    const modRequiresUpdateMut = trpc.mod.requireUpdate.useMutation();

    if (filters?.timeframe && !receivedRating) {
        switch (filters.timeframe) {
            case 0:
                setRating(mod.ratingHour);

                break;

            case 1:
                setRating(mod.ratingDay);

                break;

            case 2:
                setRating(mod.ratingWeek);

                break;

            case 3:
                setRating(mod.ratingMonth);

                break;

            case 4:
                setRating(mod.ratingYear);

                break;

            case 5:
                setRating(mod.totalRating);

            default:
                setRating(mod.ratingHour);
        }

        setReceivedRating(true);
    }

    // Controls whether user rated this mod or not.
    const [didRate, setDidRate] = useState(false);
    const [rateIsPositive, setRateIsPositive] = useState(false);

    if (cur_rating && !didRate) {
        if (cur_rating.positive)
            setRateIsPositive(true);

        setDidRate(true);
    }

    const myRatingMut = trpc.modRating.addModUserRating.useMutation();

    // Arrow classes.
    const classes_up = ["w-12", "h-12", "text-center"];
    const classes_down = ["w-12", "h-12", "text-center"];

    if (didRate) {
        if (rateIsPositive)
            classes_down.push("opacity-20");
        else
            classes_up.push("opacity-20");
    }

    // Container classes.
    let classes_container = "mod-rating-container";

    if (classes)
        classes_container = classes_container + " " + classes.join(" ");

    return (
        <div className={classes_container}>
            <div>
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

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating - 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({ id: mod.id });

                        setDidRate(true);
                        setRateIsPositive(false);
                    } else if (session?.user == null)
                        signIn("discord");
                }}>
                    <DownArrow2
                        classes={classes_down}
                    />
                </button>
            </div>
            <div>
                <span>{rating.toString()}</span>
            </div>
            <div>
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

                        // Since we recalculate off of scheduling, set visible rating now.
                        const curRating = Number(rating);
                        setRating(curRating + 1);

                        // Require updating.
                        modRequiresUpdateMut.mutate({ id: mod.id });

                        setDidRate(true);
                        setRateIsPositive(true);
                    } else if (!session?.user)
                        signIn("discord");
                }}>
                    <UpArrow2
                        classes={classes_up}
                    />
                </button>
            </div>
        </div>
    );
}

export default RatingRender;