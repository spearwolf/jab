
/**
 * Take a value. If the value is a function execute it and reuse the result as value.
 * Return the value.
 */
export default function (value) {
    let result = value;
    if (typeof result === 'function') {
        result = result();
    }
    return result;
}

