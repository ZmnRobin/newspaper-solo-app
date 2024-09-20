export interface User {
    id: number;
    name:string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Genre {
    id: number;
    name: string;
};
export interface Articles {
    id: number;
    title: string;
    content: string;
    thumbnail?: string;
    published_at: Date;
    author_id: string;
    createdAt: Date;
    updatedAt: Date;
    User: User;
    Genres: Genre[];
}
export interface Article{
    genres: any;
    id: number;
    title: string;
    content: string;
    thumbnail?: string;
    published_at: Date;
    author_id: string;
    createdAt: Date;
    updatedAt: Date;
    User: User;
    Genres: Genre[];
}
