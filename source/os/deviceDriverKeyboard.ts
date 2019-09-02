/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            //TODO: Accept and Display punctuation and characters
            //TODO: Accept Backspace
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 48 && keyCode <= 57)||   // digits
                        (keyCode == 32) ||   // space
                        (keyCode == 8) ||   // backspace
                        (keyCode == 13) || // enter
                        (keyCode == 9) ||  // tab
                        (keyCode == 38) || // up arrow
                        (keyCode == 40)) {  // down arrow
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if((keyCode >= 186 && keyCode <=192)||   // special chars
                        (keyCode >=219 && keyCode<=222)){
                //need to find more efficient place to load special character array
                var specialChars = {
                    186 : ";",
                    187 : "=",
                    188 : ",",
                    189 : "-",
                    190 : ".",
                    191 : "\\",
                    192 : "`",
                    219 : "{",
                    220 : "/",
                    221 : "}",
                    222 : "'"
                };
                chr = specialChars[keyCode];

                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
