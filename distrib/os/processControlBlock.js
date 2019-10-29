/* ------------
     ProcessControlBlock.ts

     Routines for the OS.

     Process Control Block maintains all necesarry information regarding a process.
     Process Control Blocks are instantiated and stored in MemoryManager class.
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, instrReg, memStart, memEnd, pc, Acc, Xreg, Yreg, Zflag, isExecuting, state, currentSegment) {
            if (pid === void 0) { pid = 0; }
            if (instrReg === void 0) { instrReg = new TSOS.Byte("00"); }
            if (memStart === void 0) { memStart = new TSOS.Byte("00"); }
            if (memEnd === void 0) { memEnd = new TSOS.Byte("00"); }
            if (pc === void 0) { pc = 0; }
            if (Acc === void 0) { Acc = new TSOS.Byte("00"); }
            if (Xreg === void 0) { Xreg = new TSOS.Byte("00"); }
            if (Yreg === void 0) { Yreg = new TSOS.Byte("00"); }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (state === void 0) { state = "new"; }
            if (currentSegment === void 0) { currentSegment = TSOS.MemorySegment; }
            this.pid = pid;
            this.instrReg = instrReg;
            this.memStart = memStart;
            this.memEnd = memEnd;
            this.pc = pc;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.state = state;
            this.currentSegment = currentSegment;
        }
        ProcessControlBlock.prototype.init = function (pid, memStart, memEnd, currentSegment) {
            this.pid = _PidCount;
            this.memStart = memStart;
            this.memEnd = memEnd;
            this.currentSegment = currentSegment;
        };
        ProcessControlBlock.prototype.assureProcessSize = function (logicalLocation) {
            // Handles the possibility of a newly written byte increasing program size.
            // gets physical location by adding logical location to the 
            if (this.memStart + logicalLocation >= this.memEnd) {
                this.memEnd = this.memStart + logicalLocation;
            }
        };
        ProcessControlBlock.prototype.setCompleted = function () {
            this.state = "completed";
        };
        ProcessControlBlock.prototype.branchPC = function (val) {
            if (this.pc + val > this.currentSegment.size) {
                console.log(((val + this.pc) - this.currentSegment.size) - 1);
                this.pc = ((val + this.pc) - this.currentSegment.size) - 1;
            }
            else {
                console.log(this.pc + (val - 1));
                this.pc += (val - 1);
            }
        };
        // Updates pcb values to match cpu values. 
        ProcessControlBlock.prototype.update = function (cpu) {
            this.Acc = cpu.Acc;
            this.Xreg = cpu.Xreg;
            this.Yreg = cpu.Yreg;
            this.Zflag = cpu.Zflag;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
