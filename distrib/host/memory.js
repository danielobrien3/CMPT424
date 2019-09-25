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
        function Memory(memory) {
            if (memory === void 0) { memory = new Array(); }
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            this.memory = new Array();
            this.size = 0;
        };
        Memory.prototype.load = function (base, program) {
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            // need a load counter because base might not start at 0. 
            var loadCounter = 0;
            for (var i = base; i < program.length; i++) {
                memory[i] = program[loadCounter];
                loadCounter++;
            }
            size += program.length;
        };
        Memory.prototype.write = function (location, byte) {
            // Write function handles writing single bytes into memory
            memory[location] = byte;
        };
        Memory.prototype.read = function (base, end) {
            // Read function handles reading and returning stored memory. 
            // Need a load counter because base might not start at 0.
            var loadCounter = 0;
            var readMemory = new Array();
            for (var i = base; i < end; i++) {
                readMemory[i] = memory[i];
            }
            return readMemory;
        };
        Memory.prototype.empty = function (segment) {
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for (var i = segment.base; i < segment.size; i++) {
                memory[i] = "OO";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
