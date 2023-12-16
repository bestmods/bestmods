import { signIn, signOut, useSession } from "next-auth/react"
import { type Dispatch, type SetStateAction, useState } from "react";
import { useCookies } from "react-cookie";
import PhotoIcon from "./icons/photo";
import UserIcon from "./icons/user";
import GearIcon from "./icons/gear";
import RightToBracketIcon from "./icons/right_to_bracket";
import ExitIcon from "./icons/exit";

export default function Settings ({
    showBg,
    setShowBg
} : {
    showBg: boolean
    setShowBg: Dispatch<SetStateAction<boolean>>
}) {
    const { data: session } = useSession();

    const [showMenu, setShowMenu] = useState(false);

    const [,setCookie] = useCookies(["bm_showbg"]);

    return (
        <div className={`${showMenu ? "h-[11rem]" : "h-14"} overflow-hidden fixed z-20 bottom-0 left-0 px-4 py-2 transition-all duration-300 bg-bestmods-3 flex flex-col justify-end gap-8 rounded-tr`}>
            <button
                className="cursor-pointer"
                onClick={() => {
                    setShowBg(!showBg);
                    setCookie("bm_showbg", !showBg ? "1" : "0");
                }}
            >
                <PhotoIcon className={`w-8 h-8 rounded-full stroke-white fill-none ${showBg ? "brightness-100" : "brightness-50"}`} />
            </button>
            <button
                className="cursor-pointer"
                onClick={async () => {
                    if (session?.user)
                        await signOut();
                    else
                        await signIn("discord");
                }}
            >
                {session?.user ? (
                    <ExitIcon className="w-8 h-8 fill-red-400" />
                ) : (
                    <RightToBracketIcon className="w-8 h-8 fill-white" />
                )}
            </button>
            <div
                className="cursor-pointer"
                onClick={() => {
                    setShowMenu(!showMenu);
                }}
            >
                <GearIcon className="w-8 h-8 stroke-white fill-none" />
            </div>
        </div>
    )
}