import { signIn, signOut, useSession } from "next-auth/react"
import { type Dispatch, type SetStateAction, useState } from "react";
import { useCookies } from "react-cookie";
import PhotoIcon from "./icons/photo";
import UserIcon from "./icons/user";
import GearIcon from "./icons/gear";

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
        <div className="fixed z-20 bottom-0 left-0 p-4 duration-300 bg-bestmods-3 flex flex-col justify-center items-center gap-8 group rounded-tr">
            <button
                className={showMenu ? "block cursor-pointer" : "hidden"}
                onClick={() => {
                    setShowBg(!showBg);
                    setCookie("bm_showbg", !showBg ? "1" : "0");
                }}
            >
                <PhotoIcon className={`w-8 h-8 rounded-full stroke-white fill-none ${showBg ? "brightness-100" : "brightness-50"}`} />
            </button>
            <button
                className={showMenu ? "block cursor-pointer" : "hidden"}
                onClick={async () => {
                    if (session?.user)
                        await signOut();
                    else
                        await signIn("discord");
                }}
            >
                <UserIcon className="w-8 h-8 stroke-white fill-none" />
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