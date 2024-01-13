export function GetYoutubeEmbedLink(url: string): string | undefined {
    // Make sure youtube.com exists.
    if (!url.includes("youtube.com"))
        return undefined;

    // If we have a YouTube embed link already, return it.
    if (url.includes("https://youtube.com/embed"))
        return url;

    // Retrieve the video ID using regex.
    const regex = /\/watch\?v=([A-Za-z0-9_-]+)/

    const match = url.match(regex);

    if (!match || match.length < 2)
        return undefined;

    const vId = match[1];

    return `https://youtube.com/embed/${vId}`;
}