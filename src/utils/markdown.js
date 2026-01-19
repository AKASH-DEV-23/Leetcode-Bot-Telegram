/* ----------------------------------
   MARKDOWN V2 ESCAPER
----------------------------------- */
export const escapeMarkdownV2 = (text = "") =>
    text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");

/* ----------------------------------
   TELEGRAM MESSAGE BUILDER
----------------------------------- */
export const buildTelegramMessage = ({
    title,
    difficulty,
    mainText,
    constraintsText,
}) => {
    return `
📌 *TODAY’S INTERVIEW QUESTION*

🧩 *${escapeMarkdownV2(title)}*

💻 *Problem Description*

${escapeMarkdownV2(mainText)}

🧮 *Constraints*
${escapeMarkdownV2(constraintsText)}
`.trim();
};
