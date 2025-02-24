export interface message {
    content: string;
    role: string;
    id: string;
}

export interface ChatSession {
    id: string;
    messages: message[];
    createdAt: Date;
    title: string;
}