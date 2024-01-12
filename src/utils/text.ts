export function LimitText(text: string, limit = 24): string {
    if (text.length > limit) {
        return text.substring(0, limit) + "...";
    }
    
    return text;
}