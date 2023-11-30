import { nameMetadataKey } from "../common/decorators/entity.decorator";

export declare type EntityType<T> = {
    new (): T;
} | Function;

export class Entity {
    static getRoute<T>(target: EntityType<T>, pluralize: boolean = false): string {
        const s = Reflect.getMetadata(nameMetadataKey, target)

        if ('string' !== typeof s) return s;
        let result = '', i = 0, len = s.length;
        for (; i < len; i++) {
            if (s[i] === s[i].toUpperCase())
                result += '-' + s[i].toLowerCase();
            else
                result += s[i].toLowerCase();
        }
        result = result[0] !== '-' ? result : result.substr(1);
        if (pluralize) {
            const suffix = result.endsWith('s') ? 'es' : 's'
            result = result.concat(suffix);
        }
        return result;
    }
}
