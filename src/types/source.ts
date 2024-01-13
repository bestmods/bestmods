import { type Prisma } from "@prisma/client"

export type SourceWithModCount = Prisma.SourceGetPayload<{
    include: {
        _count: {
            select: {
                ModSource: true
            }
        }
    }
}>