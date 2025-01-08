import "reflect-metadata";

export const nameMetadataKey = Symbol("name");

export function Entity(name?: string): any {
    return (target: Object) => {
        Reflect.defineMetadata(nameMetadataKey, name, target);
        return target;
    };
}
