// eslint-disable-next-line max-len
/* eslint-disable prefer-rest-params, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
export function createProxy<T extends object>(
    importPath: string,
    constructorArgs: Array<unknown>,
    methods: Array<keyof T>,
): T {
    const methodSet = new Set<keyof T>(methods);

    let instancePromise: Promise<T> | undefined;
    let constructedInstance: T | undefined;

    return new Proxy({}, {
        get(target, prop, receiver) {
            // Check if we have instance set
            const instance = constructedInstance;
            if (instance !== undefined) {
                // @ts-ignore
                return instance[prop];
            }

            // Check if said method is in allowed list
            if (!methodSet.has(prop as keyof T)) {
                throw new Error("Illegal state"); // TODO: better message or something
            }

            // Don't allow users to fool around
            if (prop === "init") {
                return Promise.resolve();
            }

            // Grab init promise
            let initPromise = instancePromise;
            if (initPromise === undefined) {
                initPromise = import(importPath).then(async (imported) => {
                    const ctor = imported.default;
                    if (typeof ctor !== "function") {
                        throw new Error(`Expected module '${importPath}' default export to be a class`);
                    }

                    constructedInstance = new ctor(...constructorArgs) as T;
                    if (Object.hasOwn(constructedInstance as object, "init")) {
                        // @ts-ignore
                        await constructedInstance.init();
                    }

                    return constructedInstance;
                });
            }

            // Return wrapper async function;
            return async function () {
                const inst = await initPromise as any;

                return inst[prop].call(inst, ...arguments);
            };
        },
    }) as T;
}
