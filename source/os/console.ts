/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public bufferHistory = [],
                    public bufferIndex = 0,
                    public bsod = false) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        //Changes canvas color to blue.
        // TODO: Make sure error gets displayed properly. 
        public blueScreen(): void {
            _DrawingContext.fillStyle = '#add8e6';
            //_DrawingContext.fillRect(0,0, _Canvas.width, _Canvas.height);
            this.resetXY();

            // Stops the handling of any more input (when it gets set to true... temporarily disabled).
            this.bsod = false;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0 && this.bsod == false) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                var offset;
                var startX;
                var startY;
                var endX;
                var endY;

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                
                // Enter key
                if (chr === String.fromCharCode(13)) { 
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer, false);
                    // Add buffer to buffer history... 
                    // ... and reset our buffer.
                    this.bufferHistory.push(this.buffer)
                    this.buffer = "";

                    // ...reset history index too
                    this.bufferIndex = 0;
                }

                // Up/down Arrow
                else if (chr === String.fromCharCode(38) || chr === String.fromCharCode(40)){
                    // Clear text currently on line...
                    offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, '>');
                    startX = offset;
                    startY = this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize);
                    endX = _Canvas.width;
                    endY = _Canvas.height;
                    _DrawingContext.clearRect(startX, startY, endX, endY);
                    this.currentXPosition = offset;

                    // Check whether to iterate up or down in buffer history...
                    // ...and check if the index is still in bounds
                    if(chr === String.fromCharCode(38) && this.bufferIndex < this.bufferHistory.length - 2){
                        this.bufferIndex += 1;
                    } else if(chr === String.fromCharCode(40) && this.bufferIndex > 0){
                        this.bufferIndex -= 1;
                    } 

                    //...then draw the command
                    var Ndx = this.bufferHistory.length - this.bufferIndex;
                    if(Ndx <= this.bufferHistory.length && Ndx >= 0){
                        this.putText(this.bufferHistory[Ndx])
                        this.buffer = this.bufferHistory[Ndx];
                    }
                } 

                

                // Tab Key
                else if(chr === String.fromCharCode(9)){
                    // Tab key marks an attempt at autocompletion
                    // performed in shell
                    this.buffer +=_OsShell.handleInput(this.buffer, true);

                // Backspace
                } else if(chr === String.fromCharCode(8)){
                    //Backspace erases the last character by clearing the screen in that area...
                    //... Use buffer to get offset size for backspace...
                    //... delete char and update currentXposition
                    offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
                    startX = this.currentXPosition - offset;
                    startY = this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize);
                    endX = _Canvas.width;
                    endY = _Canvas.height;
                    _DrawingContext.clearRect(startX, startY, endX, endY);
                    this.currentXPosition -= offset;

                    //... and update buffer to remove deleted character
                    this.buffer = this.buffer.substring(0, this.buffer.length-1);
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
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */

            if (text !== "") {

                // Gets the text to be printed. Splits into an array to handle multiple words passed at once. (Need to check length because a lone space will get lost in text.split(" "))
                var textSplit:string[];
                if(text.length == 1){
                    textSplit = [text];
                }
                else{
                    textSplit = text.split(" ");
                }

                // Check if line-wrap is necessary by...
                // ... splitting the text by space, looping through the array...
                for(var i = 0; i < textSplit.length; i++){
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textSplit[i]);
                    // ... and checking if the text will push past the canvas width.
                    if (this.currentXPosition + offset > _Canvas.width){
                        // line wrap
                        this.advanceLine();
                        // add indent
                        this.currentXPosition += _DrawingContext.measureText(this.currentFont, this.currentFontSize, "  ");
                    }

                    // Then we draw the text at the current X and Y coordinates...
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, textSplit[i]);
                    // ... add a space to make up for splitting the text...
                    // ... but only if its longer than a single character...
                    if(text.length > 1){
                        this.currentXPosition = this.currentXPosition + _DrawingContext.measureText(this.currentFont, this.currentFontSize, " ");
                    }
                    // ... and shift the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
                
                
            }
         }

        public advanceLine(): void {
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
            if(this.currentYPosition >= (_Canvas.height - (_DrawingContext.fontAscent(this.currentFont, this.currentFontSize) +
                        _FontHeightMargin))){
                //get image data, then put back everything from below the first line.
                var imageData = _DrawingContext.getImageData(0, 
                        (_DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin), 
                        _Canvas.width,
                        _Canvas.height);

                _DrawingContext.putImageData(imageData, 0, 0)

                this.currentYPosition -= _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            }
        }
    }
 }
