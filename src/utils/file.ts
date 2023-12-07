export function FileType (str: string): string {
    let fileType = "unknown";

    switch (str[0]) {
        case '/':
            fileType = "jpeg";

            break;

        case 'i':
            fileType = "png";

            break;

        case 'R':
            fileType = "gif";

            break;

        case 'U':
            fileType = "webp";

            break;
    }

    return fileType;
}

export async function GetContents (file: File) {
    const reader = new FileReader();

    return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();

            reject(new DOMException("Problem parsing input file."));
        };

        reader.onload = () => {
            resolve(reader.result);
        };
        
        reader.readAsDataURL(file);
    });
}