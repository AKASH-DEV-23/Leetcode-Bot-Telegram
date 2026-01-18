import fs from "fs";

const FILE = "./subscribers.json";

function read() {
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function write(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function subscribe(chatId, hour) {
    const users = read();
    const user = users.find(u => u.chatId === chatId);

    if (user) {
        user.hour = hour;
    } else {
        users.push({ chatId, hour });
    }

    write(users);
}

export function unsubscribe(chatId) {
    write(read().filter(u => u.chatId !== chatId));
}

export function getSubscribers() {
    return read();
}

export function getUser(chatId) {
    const users = read();
    return users.find(u => u.chatId === chatId);
}
