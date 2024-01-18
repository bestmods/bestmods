export function FileType (str: string): string | null {
    switch (str[0]) {
        case '/':
            return "jpeg";

        case 'i':
            return "png";

        case 'R':
            return "gif";

        case 'U':
            return "webp";
    }

    return null;
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