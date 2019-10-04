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
        };
        Memory.prototype.load = function (segment, program) {
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            // Need a load counter because segment base might be 0, so we can't use it as a program index.
            // Load counter makes sure we read from the 0 index of the program. 
            var loadCounter = 0;
            for (var i = segment.base; i < program.length; i++) {
                this.mem[i] = new TSOS.Byte(program[loadCounter]);
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
            // Increment pcb count here
            var tempResult = this.mem[pcb.pc];
            pcb.pc++;
        };
        Memory.prototype.empty = function (pcb) {
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for (var i = pcb.segment.base; i < pcb.segment.base + pcb.segment.size; i++) {
                this.mem[i] = new TSOS.Byte("00");
            }
            pcb.setEmpty();
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
            temp++;
            return temp.toString(16);
        };
        return Byte;
    }());
    TSOS.Byte = Byte;
})(TSOS || (TSOS = {}));
