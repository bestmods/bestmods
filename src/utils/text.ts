export function LimitText(text: string, limit: number = 24): string {
    if (text.length > limit) {
        return text.substring(0, limit) + "...";
    }
    
    return text;
}