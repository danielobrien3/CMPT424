 /* ------------
     cpuScheduler.ts

     CPU Scheduler class. Holds array with all processes that have been run. 
     ------------ */

module TSOS {

    export class CpuScheduler {

        constructor(public quantum: number = 6,
            public currentProcessNdx: number = null){}

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

