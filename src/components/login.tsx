import { signIn, signOut, useSession } from "next-auth/react";

import UserIcon from "@components/icons/user";

export default function Login () {
    const { data: session } = useSession();

    return (
        <div className="absolute top-0 right-0 rounded-bl bg-cyan-800 hover:bg-cyan-900">
            {session == null ? (
                <button className="p-4 text-center " onClick={() => {
                    signIn("discord");
                }}>
                    <span>
                        <UserIcon
                            className={"w-6 h-6"}
                        />
                    </span>
                </button>
            ) : (
                <button className="p-4 text-center text-white bg-cyan-800 hover:bg-cyan-900" onClick={() => {
                    signOut();
                }}>Sign Out</button>
            )}
        </div>
    )
}