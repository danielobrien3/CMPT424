/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        Cpu.prototype.execute = function (pcb) {
            // Check to make sure "is executing" is false
            this.isExecuting = true;
            var byte = new TSOS.Byte(_MemoryAccessor.read(pcb).value);
            switch (byte.value) {
                // Load accumulator
                case "A9": {
                    this.LDA(_MemoryAccessor.read(pcb));
                }
                // Store accumulator in memory
                case "8D": {
                    // Gets location value by storing both bytes in a string, and then converting the string to base 10.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var tempLocation = _MemoryAccessor.read(pcb).value + _MemoryAccessor.read(pcb).value;
                    var location = parseInt(temp, 16);
                    _MemoryAccessor.write(pcb, location, this.Acc);
                }
            }
        };
        Cpu.prototype.LDA = function (byte) {
            this.Acc = byte.value;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
