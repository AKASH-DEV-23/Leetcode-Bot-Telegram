import { InlineKeyboard } from "grammy";

/* ----------------------------------
   TIME HELPERS
----------------------------------- */
export function getLocalHour(offsetMinutes) {
    const utc = new Date();
    const local = new Date(utc.getTime() + offsetMinutes * 60000);
    return local.getHours();
}

/* ----------------------------------
   HOUR SELECTION KEYBOARD
----------------------------------- */
export function hourKeyboard() {
    const keyboard = new InlineKeyboard();

    for (let i = 0; i < 24; i++) {
        const label = `${String(i).padStart(2, "0")}:00`;
        keyboard.text(label, `hour_${i}`);

        if ((i + 1) % 4 === 0) keyboard.row();
    }

    return keyboard;
}
