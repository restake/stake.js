import { z } from "zod";

export const Asset = z.object({
    id: z.string(),
});

export type Asset = z.infer<typeof Asset>;

export const Account = z.object({
    id: z.string(),
    name: z.string(),
    assets: z.array(Asset),
});

export type Account = z.infer<typeof Account>;
