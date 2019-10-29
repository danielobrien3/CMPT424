/* ------------
     Memory.ts

     Routines for the host.

     Memory class should only load, write, and read programs.
     All decisions regarding segments the program will utilize is done in memoryManager.
     All
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(mem) {
            if (mem === void 0) { mem = [new TSOS.Byte()]; }
            this.mem = mem;
        }
        Memory.prototype.init = function () {
            this.mem = new Array();
            for (var i = 0; i < 767; i++) {
                this.mem.push(new TSOS.Byte("00"));
            }
            TSOS.Control.generateMemoryDisplay();
        };
        Memory.prototype.load = function (segment, program) {
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            // Need a load counter because segment base might be 0, so we can't use it as a program index.
            // Load counter makes sure we read from the 0 index of the program. 
            var loadCounter = 0;
            console.log("loading at base value of " + segment.base);
            for (var i = segment.base; i < segment.base + program.length; i++) {
                console.log("<" + program[loadCounter] + "> is being written to location <" + i + ">");
                this.mem[i] = new TSOS.Byte(program[loadCounter].toUpperCase());
                loadCounter++;
            }
        };
        Memory.prototype.writeToLocation = function (physicalLocation, newByte) {
            // Write function handles writing single bytes into mem
            // Verbose name because apparently 'write' is a javascript keyword?
            this.mem[physicalLocation] = newByte;
        };
        Memory.prototype.read = function (pcb) {
            // Read function handles reading and returning stored mem. 
            // The byte is stored in a temp variable so program counter can increment here
            return this.mem[pcb.pc];
        };
        Memory.prototype.readAtLocation = function (physicalLocation) {
            return this.mem[physicalLocation];
        };
        Memory.prototype.empty = function (pcb) {
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for (var i = pcb.segment.base; i < pcb.segment.limit; i++) {
                this.mem[i] = new TSOS.Byte("00");
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
(function (TSOS) {
    var Byte = /** @class */ (function () {
        function Byte(value) {
            if (value === void 0) { value = "00"; }
            this.value = value;
        }
        //TODO: Write a function that adds a second byte value to this byte value...
        //... and returns the sum parsed into decimal. 
        // |This will be used for converting provided memory values to decimal|
        Byte.prototype.setValue = function (newValue) {
            this.value = newValue;
        };
        Byte.prototype.getBaseTen = function () {
            // Handles returning the byte's hex value in base 10. 
            return parseInt(this.value, 16);
        };
        Byte.prototype.increment = function () {
            // Handles incrementing the byte's hex value.
            // Stores decimal representation of byte value in temp then increments temp and converts it back. 
            // There may be a 'better' way to do this in hex, but I like how simple this is. 
            var temp = parseInt(this.value, 16);
            var res;
            temp++;
            if (temp.toString(16).length == 1) {
                res = ("0" + temp.toString(16));
            }
            else {
                res = temp.toString(16);
            }
            return new Byte(res.toUpperCase());
        };
        // Add 2 bytes and return them as byte value
        Byte.prototype.add = function (byte) {
            var temp = this.getBaseTen() + byte.getBaseTen();
            if (temp.toString(16).length = 1) {
                return new Byte("0" + temp.toString(16));
            }
            else {
                return new Byte(temp.toString(16).toUpperCase());
            }
        };
        Byte.prototype.calculateLocation = function (byte) {
            // Takes two bytes, adds them together, and converts to base 10. 
            // This is for getting a memory location value as they are provided in the opcode expressions. 
            // Passed byte is added first since these are strings and we want the memory loaded second to be in front. 
            var location = byte.value + this.value;
            return parseInt(location, 16);
        };
        Byte.prototype.isEqual = function (byte) {
            return (this.getBaseTen() == byte.getBaseTen());
        };
        return Byte;
    }());
    TSOS.Byte = Byte;
})(TSOS || (TSOS = {}));
