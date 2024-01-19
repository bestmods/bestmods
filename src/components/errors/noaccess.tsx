import { signIn } from "next-auth/react";
import Link from "next/link";

export default function NoAccess() {
    return (
        <div className="flex flex-col gap-2">
            <h2>No Permissions!</h2>
            <div className="bg-bestmods-2/80 rounded p-4">
                <p>You do not have access to view this page. Please make sure you{"'"}re signed in and have access to view this page. You may click <Link href="#" onClick={() => void signIn("discord")}>here</Link> to sign in.</p>
                    
                <p>If you{"'"}re still having issues, please contact an administrator.</p>
            </div>
        </div>
    )
}