

let isLogOn = false; // jmr

export function turnLogOff() {
    isLogOn = false;
}
export function turnLogOn() {
    isLogOn = true;
}

export function log() {
    if (isLogOn) {
        console.log.apply(console, arguments);
    }
}

export function warn() {
    console.warn.apply(console, arguments);
}

export function error() {
    console.error.apply(console, arguments);
}
