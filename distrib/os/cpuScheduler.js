/* ------------
    cpuScheduler.ts

    CPU Scheduler class. Holds array with all processes that have been run.
    ------------ */
var TSOS;
(function (TSOS) {
    var CpuScheduler = /** @class */ (function () {
        function CpuScheduler(quantum, executingProcesses, currentProcessNdx) {
            if (quantum === void 0) { quantum = 6; }
            if (executingProcesses === void 0) { executingProcesses = new Array(); }
            if (currentProcessNdx === void 0) { currentProcessNdx = null; }
            this.quantum = quantum;
            this.executingProcesses = executingProcesses;
            this.currentProcessNdx = currentProcessNdx;
        }
        CpuScheduler.prototype.addProcess = function (pcb) {
            this.executingProcesses.push(pcb);
            if (this.currentProcessNdx == null) {
                this.currentProcessNdx = 0;
            }
        };
        CpuScheduler.prototype.getNextProcess = function () {
            var nextProcessNdx = this.currentProcessNdx + 1;
            while (nextProcessNdx != this.currentProcessNdx) {
                if (_MemoryManager.processControlBlocks()) { }
            }
        };
        CpuScheduler.prototype.clearQueue = function (emptyFlag) {
            // setEmpty handles segment empty flag 
            this.executingProcesses = new Array();
        };
        return CpuScheduler;
    }());
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
