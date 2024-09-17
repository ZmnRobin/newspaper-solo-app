export interface User {
    id: Number;
    name:String;
    email: String;
    password: String;
    role: String;
    createdAt: Date;
    updatedAt: Date;
}
export interface Articles {
    id: Number;
    title: String;
    content: String;
    thumbnail?: String;
    published_at: Date;
    author_id: String;
    createdAt: Date;
    updatedAt: Date;
    User: User;
}
export interface Article{
    id: Number;
    title: String;
    content: String;
    thumbnail?: String;
    published_at: Date;
    author_id: String;
    createdAt: Date;
    updatedAt: Date;
    User: User;
}
