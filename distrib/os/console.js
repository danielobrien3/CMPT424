/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, bufferHistory, bufferIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (bufferHistory === void 0) { bufferHistory = []; }
            if (bufferIndex === void 0) { bufferIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.bufferHistory = bufferHistory;
            this.bufferIndex = bufferIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                // Enter key
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer, false);
                    // Add buffer to buffer history... 
                    // ... and reset our buffer.
                    this.bufferHistory.push(this.buffer);
                    this.buffer = "";
                }
                // Up Arrow
                else if (chr === String.fromCharCode(38)) {
                    this.bufferIndex += 1;
                    var Ndx = this.bufferHistory.length - this.bufferIndex;
                    if (Ndx <= this.bufferHistory.length && Ndx >= 0) {
                        this.putText(this.bufferHistory[Ndx]);
                        this.buffer = this.bufferHistory[Ndx];
                    }
                }
                //Down Arrow
                else if (chr === String.fromCharCode(40)) {
                    this.bufferIndex -= 1;
                    var Ndx = this.bufferHistory.length - this.bufferIndex;
                    if (Ndx <= this.bufferHistory.length && Ndx >= 0) {
                        this.putText(this.bufferHistory[Ndx]);
                        this.buffer = this.bufferHistory[Ndx];
                    }
                }
                // Tab Key
                else if (chr === String.fromCharCode(9)) {
                    // Tab key marks an attempt at autocompletion
                    // perform in shell
                    this.buffer += _OsShell.handleInput(this.buffer, true);
                    // Backspace
                }
                else if (chr === String.fromCharCode(8)) {
                    //Backspace erases the last character...
                    //erase from screen
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
                    var startX = this.currentXPosition - offset;
                    var startY = this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize);
                    var endX = _Canvas.width;
                    var endY = _Canvas.height;
                    _DrawingContext.clearRect(startX, startY, endX, endY);
                    this.currentXPosition -= offset;
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                // Normal Character
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            //Shouldn't scroll until it is necessary
            if (this.currentYPosition >= (_Canvas.height - (_DrawingContext.fontAscent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin))) {
                //get image data, then put back everything from below the first line.
                var imageData = _DrawingContext.getImageData(0, (1.5 * (_DrawingContext.fontAscent(this.currentFont, this.currentFontSize))), _Canvas.width, _Canvas.height);
                _DrawingContext.putImageData(imageData, 0, 0);
                this.currentYPosition -= (1.5 *
                    _DrawingContext.fontAscent(this.currentFont, this.currentFontSize));
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
