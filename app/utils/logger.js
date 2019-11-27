

let isLogOn = false;

export function turnLogOff() {
    isLogOn = false;
}
export function turnLogOn() {
    isLogOn = true;
}

export function log() {
    if (isLogOn) {
        // jmr   console.log.apply(console, arguments);
    }
}

export function warn() {
    console.warn.apply(console, arguments);
}

export function error() {
    console.error.apply(console, arguments);
}
