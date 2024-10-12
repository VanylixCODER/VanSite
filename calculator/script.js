let memory = 0;

function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    document.getElementById("display").value = memory;
}

function memoryAdd() {
    memory += parseFloat(document.getElementById("display").value);
}

function memorySubtract() {
    memory -= parseFloat(document.getElementById("display").value);
}

function memorySave() {
    memory = parseFloat(document.getElementById("display").value);
}

function appendToDisplay(value) {
    playClickSound();   
    let display = document.getElementById("display").value;
    
    // Set a limit of 16 characters
    if (display.length < 16) {
        document.getElementById("display").value += value;
    }
}

function clearEntry() {
    playClickSound();
    document.getElementById("display").value = "";
}

function clearDisplay() {
    playClickSound();
    document.getElementById("display").value = "";
    memoryClear();
}

function deleteLast() {
    playClickSound();
    let display = document.getElementById("display").value;
    document.getElementById("display").value = display.slice(0, -1);
}

function inverse() {
    playClickSound();
    let display = document.getElementById("display").value;
    document.getElementById("display").value = (1 / parseFloat(display)).toFixed(5); // rounding for convenience
}

function square() {
    playClickSound();
    let display = document.getElementById("display").value;
    document.getElementById("display").value = Math.pow(parseFloat(display), 2).toFixed(5);
}

function changeSign() {
    playClickSound();
    let display = document.getElementById("display").value;
    document.getElementById("display").value = (parseFloat(display) * -1).toFixed(5);
}

function calculate() {
    playClickSound();
    let display = document.getElementById("display").value;
    
    // Replace operations with correct symbols
    display = display.replace(/x/g, '*').replace(/÷/g, '/'); // Replacing 'x' with '*' and '÷' with '/'
    
    try {
        // Call eval for simple arithmetic
        document.getElementById("display").value = eval(display.replace(',', '.')).toFixed(5); // rounding for convenience
    } catch (e) {
        document.getElementById("display").value = "Error";
    }
}

function playClickSound() {
    // Check if a sound element with id "click-sound" exists
    const clickSound = document.getElementById("click-sound");
    if (clickSound) {
        clickSound.currentTime = 0; 
        clickSound.play();
    }
}

document.addEventListener('keydown', function(event) {
    const key = event.key;

    if (!isNaN(key) || ['+', '-', '*', '/', 'Enter', 'Backspace', '.', 'Escape'].includes(key)) {
        playClickSound(); 
        if (key === 'Enter') {
            calculate();
        } else if (key === 'Backspace') {
            deleteLast();
        } else if (key === 'Escape') {
            clearDisplay();
        } else {
            appendToDisplay(key === '*' ? '·' : key === '/' ? '÷' : key);
        }
    }
});
