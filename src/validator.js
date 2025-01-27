import path from 'path';

function trimString(value) {

}

export function validateString(value, name) {
    if (typeof value !== 'string' ) {
        throw new Error(`Invalid ${name}: must be a string`);
    }
    if (value.trim().length === 0) {
        throw new Error(`Invalid ${name}: must be a non-empty string`);
    }
    return value;
}

export function validateInteger(value, name) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
        throw new Error(`Invalid ${name}: must be an integer`);
    }
    return intValue;
}

export function validatePath(value, name) {
    value = validateString(value, name);
    try {
        return path.resolve(value);
    } catch (error) {
        throw new Error(`Invalid ${name}: path conversion failed - ${error.message}`);
    }
}

export function validateBoolean(value, name) {
    if (typeof value !== 'boolean') {
        throw new Error(`Invalid ${name}: must be a boolean`);
    }
    return value;
}

export function validateStringList(value, name) {
    if ( !Array.isArray(value)  || value.length === 0) {
        throw new Error(`Invalid ${name}: must be a non-empty list`);
    }
    value.forEach((item, index) => {
        if (typeof item !== 'string' || item.trim().length === 0) {
            throw new Error(`Invalid ${name}: element at index ${index} must be a non-empty string`);
        }
    });
    return value;
}

// attempt to parse a json string into a string list
export function getStringList(value, name) {
    try {
        const parsedValue = JSON.parse(value);
        return validateStringList(parsedValue, name);
    } catch (error) {
        throw new Error(`Invalid ${name}: must be a valid JSON array of strings - ${error.message}`);
    }
}