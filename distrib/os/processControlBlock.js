/* ------------
     ProcessControlBlock.ts

     Routines for the OS.

     Process Control Block maintains all necesarry information regarding a process.
     Process Control Blocks are instantiated and stored in MemoryManager class.
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, instrReg, memStart, memEnd, pc, Acc, Xreg, Yreg, Zflag, isExecuting, state, currentSegment, quantumCount, onDisk) {
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
            if (quantumCount === void 0) { quantumCount = 0; }
            if (onDisk === void 0) { onDisk = false; }
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
            this.quantumCount = quantumCount;
            this.onDisk = onDisk;
        }
        ProcessControlBlock.prototype.init = function (pid, memStart, memEnd, currentSegment, onDisk) {
            this.pid = _PidCount;
            this.memStart = memStart;
            this.memEnd = memEnd;
            this.currentSegment = currentSegment;
            this.onDisk = onDisk;
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
        ProcessControlBlock.prototype.rollOut = function () {
            this.memStart = null;
            this.memEnd = null;
            this.currentSegment.setEmpty(true);
            this.currentSegment = null;
            this.setOnDisk(true);
        };
        ProcessControlBlock.prototype.branchPC = function (val) {
            console.log("Branching <" + this.pid + ">");
            if (this.pc + val > this.currentSegment.size) {
                this.pc = ((val + this.pc) - this.currentSegment.size) - 1;
            }
            else {
                this.pc += (val - 1);
            }
        };
        ProcessControlBlock.prototype.rollIn = function (segment) {
            this.currentSegment = segment;
            this.memStart = segment.base;
            this.memEnd = segment.limit;
            this.currentSegment.setEmpty(false);
            this.setOnDisk(false);
        };
        ProcessControlBlock.prototype.kill = function () {
            this.isExecuting = false;
            this.state = "terminated";
        };
        // Updates pcb values to match cpu values. 
        ProcessControlBlock.prototype.update = function (cpu) {
            this.Acc = cpu.Acc;
            this.Xreg = cpu.Xreg;
            this.Yreg = cpu.Yreg;
            this.Zflag = cpu.Zflag;
        };
        ProcessControlBlock.prototype.setOnDisk = function (flag) {
            this.onDisk = flag;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
