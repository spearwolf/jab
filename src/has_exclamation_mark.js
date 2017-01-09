
export default function (str) {
    if (typeof str === 'string') {
        return str[str.length - 1] === '!';
    }
    return false;
}

