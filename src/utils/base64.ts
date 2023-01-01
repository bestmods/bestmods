const FileType = (str: string): string => {
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

        // Not supporting PDF for now.
        /*
        case 'J':
            fileType = "pdf";

            break;
        */
    }

    return fileType;
}

export default FileType;