import { Entity, EntityType } from "../models/entity";
import { api } from "./configs/axiosConfigs"

export class ApiService {
    getPath<T>(target: EntityType<T>,path: string, id?: any, params?: any): Promise<T> {
        const route = Entity.getRoute(target);
        const url: string = id ? `${route}/${path}/${id}` : `${route}/${path}`;
        return api.get<T>(url, { params }).then(response => response.data)
    }

    get<T>(target: EntityType<T>, id?: number, params?: any): Promise<T> {
        const route = Entity.getRoute(target);
        const url: string = id ? `${route}/${id}` : `${route}`;
        return api.get<T>(url, { params }).then(response => response.data)
    }

    save<T>(target: EntityType<T>, obj: T): Promise<T> {
        const route = Entity.getRoute(target);
        let promise;
        const id = (obj as any)['id']
        if (!id) {
            promise = api.post<T>(`${route}`, obj);
        } else {
            promise = api.patch<T>(`${route}/${id}`, obj);
        }
        return promise.then(response => response.data)
    }

    delete<T>(target: EntityType<T>, id: number): Promise<any> {
        const route = Entity.getRoute(target)
        return api.delete<T>(`${route}/${id}`).then(response => response.data)
    }

    post<T>(target: EntityType<T>, path: string, body: any): Promise<T> {
        const route = Entity.getRoute(target);
        return api.post<T>(`${route}/${path}`, body).then(response => response.data)
    }

    put<T>(target: EntityType<T>, path: string, body: any): Promise<T> {
        const route = Entity.getRoute(target);
        return api.put<T>(`${route}/${path}`, body).then(response => response.data)
    }

    patch<T>(target: EntityType<T>, path: string, body: any): Promise<T> {
        const route = Entity.getRoute(target);
        return api.patch<T>(`${route}/${path}`, body).then(response => response.data)
    }
}
