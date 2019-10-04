/* ------------
     ProcessControlBlock.ts

     Routines for the OS.

     Process Control Block maintains all necesarry information regarding a process.
     Process Control Blocks are instantiated and stored in MemoryManager class.   
     ------------ */

module TSOS {

    export class ProcessControlBlock {

        constructor(public pid: number = _PidCount,
            public instrReg: any = new Byte,
            public memStart: number = 0,
            public memEnd: number = 0,
            public pc: number = 0,
            public accumulator: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0,
            public isExecuting: boolean = false,
            public state: string = "empty",
            public currentSegment: any = new MemorySegment){}

        public init(pid, memStart, memEnd, currentSegment){
            this.pid = _PidCount;
            this.memStart = memStart;
            this.memEnd = memEnd;
            this.currentSegment = currentSegment;
        }

        public assureProcessSize(logicalLocation){
            // Handles the possibility of a newly written byte increasing program size.
            // gets physical location by adding logical location to the 
            if(this.memStart + logicalLocation >= this.memEnd){
                this.memEnd = this.memStart + logicalLocation;
            }
        }

        public empty(){
            // Handles emptying the process.
            // This includes em
            this.memEnd = 0;
            this.pc = 0;
            this.accumulator = 0;
            this.xReg = 0; 
            this.yReg - 0;
            this.zFlag = 0;
            this.state = "empty";
        }

    }
}
