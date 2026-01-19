
/* ----------------------------------
   IMAGE EXTRACTION
----------------------------------- */
export const extractImages = (html) => {
    if (!html) return [];

    const images = new Set();
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;

    let match;
    while ((match = regex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith("/")) {
            src = `https://leetcode.com${src}`;
        }
        images.add(src);
    }

    return [...images];
};

/* ----------------------------------
   SUPERSCRIPT FORMATTER
----------------------------------- */
const superscriptMap = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
};

const stripHTML = (html = "") =>
    html
        .replace(/<sup>(\d+)<\/sup>/gi, (_, n) =>
            n.split("").map(d => superscriptMap[d]).join("")
        )
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/<=/g, "≤")
        .replace(/>=/g, "≥")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

/* ----------------------------------
   TEXT CLEANER
----------------------------------- */
export const cleanText = (html, constraintsHtml) => {
    if (!html) return { mainText: "", constraintsText: "" };

    let text = html.replace(/<img[^>]*>/gi, "");

    const statementMatch = text.match(
        /^([\s\S]*?)(<strong class="example">|<p><strong class="example">)/i
    );
    const statement = statementMatch ? stripHTML(statementMatch[1]) : "";

    const exampleBlocks =
        text.match(
            /<strong class="example">[\s\S]*?(?=<strong class="example">|<strong>Constraints:|$)/gi
        ) || [];

    const examples = exampleBlocks.map(stripHTML).filter(Boolean);

    let constraintsText = "";
    if (constraintsHtml) {
        constraintsText = stripHTML(constraintsHtml)
            .replace(/^Constraints:/i, "")
            .split("\n")
            .filter(Boolean)
            .map(line => `• ${line.trim()}`)
            .join("\n");
    }

    return {
        mainText: [statement, ...examples].join("\n\n"),
        constraintsText,
    };
};

/* ----------------------------------
   DIFFICULTY FORMATTER
----------------------------------- */
export const formatDifficulty = (difficulty) => {
    if (!difficulty) return "";
    switch (difficulty.toLowerCase()) {
        case "easy":
            return "🟢 *EASY*";
        case "medium":
            return "🟡 *MEDIUM*";
        case "hard":
            return "🔴 *HARD*";
        default:
            return difficulty;
    }
};

/* ----------------------------------
   INLINE KEYBOARD
----------------------------------- */
export const buildInlineKeyboard = ({ hints = [], link }) => {
    const rows = [];

    if (Array.isArray(hints) && hints.length > 0) {
        rows.push(
            hints.map((_, i) => ({
                text: `💡 Hint ${i + 1}`,
                callback_data: `hint_${i}`,
            }))
        );
    }

    rows.push([
        { text: "⚡ Difficulty", callback_data: "difficulty" },
    ]);

    if (typeof link === "string" && link.startsWith("http")) {
        rows.push([{ text: "🔗 Open on LeetCode", url: link }]);
    }

    return { inline_keyboard: rows };
};