let keysPressed = [];
document.addEventListener("keydown", function (event) {
    let keyPressed = keysPressed.find(item => item.code == event.code);
    if (!keyPressed) {
        keyPressed = {
            code: event.code,
            parsed: false
        };
        keysPressed.push(keyPressed);
    }
});

document.addEventListener("keyup", function (event) {
    let keyPressed = keysPressed.find(item => item.code == event.code);
    if (keyPressed) {
        keysPressed.splice(keysPressed.indexOf(keyPressed), 1);
    }
});

function isKeyPressed(code, once = true) {
    let keyPressed = keysPressed.find(item => item.code == code);
    if(keyPressed == null) return false;
    let toReturn = false;
    if(once == true && keyPressed.parsed == false) toReturn = true;
    keyPressed.parsed = true;
    return toReturn;
}