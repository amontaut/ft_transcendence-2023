export type ChannelType = {
    id: number;
    name: string;
    type: number;
    owner: number;
    users: any;
    password: string;
    invite?: string;
}

export type Message = {
    id: number;
    nick: string;
    channel: number;
    author: number;
    content: string;
    date: string;
}