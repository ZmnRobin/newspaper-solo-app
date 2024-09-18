export interface User {
    id: number;
    name:string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
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
}
export interface Article{
    id: number;
    title: string;
    content: string;
    thumbnail?: string;
    published_at: Date;
    author_id: string;
    createdAt: Date;
    updatedAt: Date;
    User: User;
}
