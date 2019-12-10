 /* ------------
     cpuScheduler.ts

     CPU Scheduler class. Holds array with all processes that have been run. 
     ------------ */

module TSOS {

    export class CpuScheduler {

        constructor(public quantum: number = 6,
            public currentProcessNdx: number = null,
            public currentAlgorithm:string = "rr"){}

        public handleScheduling(pcb){
            var process;
            switch (this.currentAlgorithm) {
                case "rr":
                    process = this.checkQuantum(pcb);
                    return process;
                    break;
                
                case "fcfs":
                    process = this.fcfs(pcb);
                    return process;
                    break;

                case "priority":
                    process = this.priority(pcb);
                    return process;
                    break;
            }
        }

        public changeAlgorithm(algorithm){
            if(algorithm === "rr"){
                this.currentAlgorithm = "rr";
                _StdOut.putText("Scheduling Algorithm has been set to " + this.currentAlgorithm);
            }
            else if (algorithm === "fcfs"){
                this.currentAlgorithm = "fcfs";
                _StdOut.putText("Scheduling Algorithm has been set to " + this.currentAlgorithm);
            }
            else if (algorithm === "priority"){
                this.currentAlgorithm = "priority";
                _StdOut.putText("Scheduling Algorithm has been set to " + this.currentAlgorithm);
            }
            else {
                _StdOut.putText("Please select a scheduling algorithm from the options <rr>, <fcfs>, <priority>");
            }
        }

        public fcfs(pcb){
            // PCB id's are given in order, so just do processes in order of PID
            if(pcb.state === "completed"){
                var nextProcess = _MemoryManager.findProcessById(pcb.pid + 1);
                if(nextProcess != null){
                    return nextProcess;
                }
            }
            else {
                return pcb;
            }
        }

        public priority(pcb){
            var currentProcess = pcb;
            if(pcb.state === "completed"){
                var currentPriority = 100000; // Random number too large to be realistically used as process priority
                for(var i=0; i<_MemoryManager.processControlBlocks.length; i++){
                    if(_MemoryManager.processControlBlocks[i].priority < currentPriority){
                        var state = _MemoryManager.processControlBlocks[i].state
                        if(state != "completed" ){
                            currentProcess = _MemoryManager.processControlBlocks[i];
                            currentPriority = currentProcess.priority;
                        }
                    }
                }
                return currentProcess;
            }
            else {
                return pcb;
            }
        }


        public setQuantum(newQuantum){
            this.quantum = newQuantum;
        }

        // Checks pcb run count to quantum. Switches processes if necessary.
        public checkQuantum(pcb){
            if(pcb.quantumCount >= this.quantum){
                pcb.quantumCount = 0;
                return this.getNextProcess(pcb);
            }
            else return pcb;
        }
        
        public getNextProcess(pcb){
            for(var i=0; i<_MemoryManager.processControlBlocks.length; i++){
                if(_MemoryManager.processControlBlocks[i].pid == pcb.pid){
                    this.currentProcessNdx = i
                }
            }


            if(this.currentProcessNdx != null){
                // Starting ndx used for finding next process. 
                var nextProcessNdx = this.currentProcessNdx + 1;

                // Loop ndx back around if necessary (circular Array)
                if(nextProcessNdx >= _MemoryManager.processControlBlocks.length){
                    nextProcessNdx = 0;
                }

                while(nextProcessNdx != this.currentProcessNdx){
                    if(_MemoryManager.processControlBlocks[nextProcessNdx].state === "ready" || _MemoryManager.processControlBlocks[nextProcessNdx].state === "waiting"){
                        // If we got here, we're going to make a context switch. 
                        if(pcb.state === "executing"){
                            // If the current process isn't finished, we set its state to 'ready' to be run later. 
                            pcb.state = "waiting"
                            Control.updatePcbDisplay(pcb);
                        }
                        _MemoryManager.processControlBlocks[nextProcessNdx].state = "executing";
                        this.currentProcessNdx = nextProcessNdx;
                        return _MemoryManager.processControlBlocks[this.currentProcessNdx];
                    }
                    nextProcessNdx++

                    // Loop ndx back around if necessary (circular Array)
                    if(nextProcessNdx >= _MemoryManager.processControlBlocks.length) {
                        nextProcessNdx = 0;
                    }
                }
                // If we got here, we made a full loop. 
                // Therefore we return the initial process if it is still being executed. 
                if(_MemoryManager.processControlBlocks[this.currentProcessNdx].state === "executing" || _MemoryManager.processControlBlocks[this.currentProcessNdx].state === "waiting" ){
                    return _MemoryManager.processControlBlocks[this.currentProcessNdx];
                } else { // Otherwise the cpu has nothing to execute. Reflect this here.
                    this.currentProcessNdx = null;
                    _CPU.isExecuting = false;
                    return null;
                }
            }
        }

    }
}

