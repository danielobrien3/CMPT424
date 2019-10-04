/* ------------
     ProcessControlBlock.ts

     Routines for the OS.

     Process Control Block maintains all necesarry information regarding a process.
     Process Control Blocks are instantiated and stored in MemoryManager class.
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, instrReg, memStart, memEnd, pc, accumulator, xReg, yReg, zFlag, isExecuting, state, currentSegment) {
            if (pid === void 0) { pid = 0; }
            if (instrReg === void 0) { instrReg = new TSOS.Byte("00"); }
            if (memStart === void 0) { memStart = new TSOS.Byte("00"); }
            if (memEnd === void 0) { memEnd = new TSOS.Byte("00"); }
            if (pc === void 0) { pc = 0; }
            if (accumulator === void 0) { accumulator = new TSOS.Byte("00"); }
            if (xReg === void 0) { xReg = new TSOS.Byte("00"); }
            if (yReg === void 0) { yReg = new TSOS.Byte("00"); }
            if (zFlag === void 0) { zFlag = new TSOS.Byte("00"); }
            if (isExecuting === void 0) { isExecuting = false; }
            if (state === void 0) { state = "empty"; }
            if (currentSegment === void 0) { currentSegment = new TSOS.MemorySegment; }
            this.pid = pid;
            this.instrReg = instrReg;
            this.memStart = memStart;
            this.memEnd = memEnd;
            this.pc = pc;
            this.accumulator = accumulator;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
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
        ProcessControlBlock.prototype.empty = function () {
            // Handles emptying the process.
            // This includes em
            this.memEnd = 0;
            this.pc = 0;
            this.accumulator = 0;
            this.xReg = 0;
            this.yReg - 0;
            this.zFlag = 0;
            this.state = "empty";
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
