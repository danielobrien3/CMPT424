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
            if(pcb.quantum >= this.quantum){
                return this.getNextProcess(pcb);
            }
        }
        
        public getNextProcess(pcb){
            for(var i=0; i<_MemoryManager.processControlBlocks.length; i++){
                if(_MemoryManager.processControlBlocks[i].pid == pcb.pid){
                    this.currentProcessNdx = i
                }
            }


            if(this.currentProcessNdx != null){
                var nextProcessNdx = this.currentProcessNdx + 1;
                if(nextProcessNdx > _MemoryManager.processControlBlocks.length){
                    nextProcessNdx = 0;
                }
                while(nextProcessNdx != this.currentProcessNdx){
                    if(_MemoryManager.processControlBlocks[nextProcessNdx].state === "ready"){
                        // If we got here, we're going to make a context switch. 
                        if(_MemoryManager.processControlBlocks[this.currentProcessNdx].state === "executing"){
                            // If the current process isn't finished, we set its state to 'ready' to be run later. 
                            _MemoryManager.processControlBlocks[this.currentProcessNdx].state = "ready"
                        }
                        this.currentProcessNdx = nextProcessNdx;
                        _MemoryManager.processControlBlocks[this.currentProcessNdx].state = "executing";
                        return _MemoryManager.processControlBlocks[this.currentProcessNdx];
                    }
                }
                // If we got here, we made a full loop. 
                // Therefore we return the initial process if it is still being executed. 
                if(_MemoryManager.processControlBlocks[this.currentProcessNdx].state === "executing"){
                    return _MemoryManager.processControlBlocks[this.currentProcessNdx];
                }

                
            }

            }

            /*var nextProcess = this.processes.dequeue();
            if(nextProcess != "terminated" || nextProcess != "completed"){
                this.processes.enqueue(nextProcess)
            }

            // Create pointer to find next process
            var nextProcessNdx = this.currentProcessNdx+1
            while(nextProcessNdx != this.currentProcessNdx){
                if(this.processes[nextProcessNdx].state === "executing"){
                    // This is the process that will now be run. Set pointer and return process.
                    this.currentProcessNdx = nextProcessNdx;
                    return this.processes[this.currentProcessNdx];
                }
                else{
                    nextProcessNdx++;
                    //circular array
                    if(nextProcessNdx = this.processes.length){
                        nextProcessNdx = 0;
                    }
                }
            }
            // If we got here that means the function made a full loop to the process already running. 
            if(nextProcessNdx == this.currentProcessNdx){

            }*/
        }

        public clearQueue(emptyFlag){
            // setEmpty handles segment empty flag 
            this.processes = new Array();
        }

    }
}
