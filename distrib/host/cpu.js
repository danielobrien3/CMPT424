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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, currentProcess) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = new TSOS.Byte("00"); }
            if (Xreg === void 0) { Xreg = new TSOS.Byte("00"); }
            if (Yreg === void 0) { Yreg = new TSOS.Byte("00"); }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (currentProcess === void 0) { currentProcess = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentProcess = currentProcess;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = new TSOS.Byte("00");
            this.Xreg = new TSOS.Byte("00");
            this.Yreg = new TSOS.Byte("00");
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentProcess = 0;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var pcb = _MemoryManager.findProcessById(this.currentProcess);
            this.execute(pcb);
            TSOS.Control.updateCpuDisplay(pcb);
            TSOS.Control.updatePcbDisplay(pcb);
            this.PC = pcb.pc;
        };
        Cpu.prototype.execute = function (pcb) {
            // Check to make sure "is executing" is false
            this.isExecuting = true;
            pcb.state = "running";
            this.currentProcess = pcb.pid;
            var byte = new TSOS.Byte(_MemoryAccessor.read(pcb).value);
            switch (byte.value) {
                // Load accumulator
                case "A9": {
                    this.LDA(_MemoryAccessor.read(pcb));
                    pcb.Acc = this.Acc;
                    break;
                }
                // Store accumulator in memory
                case "8D": {
                    // Gets location value by using Byte function "calculateLocation". Byte declaration can be found in memory.ts file.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var logicalLocation = _MemoryAccessor.read(pcb).calculateLocation(_MemoryAccessor.read(pcb));
                    _MemoryAccessor.write(pcb, logicalLocation, this.Acc);
                    break;
                }
                case "00": {
                    this.halt(pcb);
                    break;
                }
            }
        };
        Cpu.prototype.halt = function (pcb) {
            this.isExecuting = false;
        };
        Cpu.prototype.LDA = function (byte) {
            this.Acc = byte;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
