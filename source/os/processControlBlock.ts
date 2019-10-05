/* ------------
     ProcessControlBlock.ts

     Routines for the OS.

     Process Control Block maintains all necesarry information regarding a process.
     Process Control Blocks are instantiated and stored in MemoryManager class.   
     ------------ */

module TSOS {

    export class ProcessControlBlock {

        constructor(public pid: number = 0,
            public instrReg: any = new Byte("00"),
            public memStart: any = new Byte("00"),
            public memEnd: any = new Byte("00"),
            public pc: number = 0,
            public Acc: any = new Byte("00"),
            public xReg: any = new Byte("00"),
            public yReg: any = new Byte("00"),
            public zFlag: number = 0,
            public isExecuting: boolean = false,
            public state: string = "new",
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

        public setCompleted(){
            this.state = "completed";
        }

    }
}
