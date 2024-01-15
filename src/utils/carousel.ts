import { type GetServerSidePropsContext } from "next";

import MobileDetect from "mobile-detect";

export function GetDeviceType(ctx: GetServerSidePropsContext): string {
    const { req } = ctx;

    let deviceType = "md";

    const agent = req.headers["user-agent"];

    if (agent) {
        const md = new MobileDetect(agent);

        if (md.mobile())
            deviceType = "xs";
        else if (md.tablet())
            deviceType = "sm";
    }

    return deviceType;
}