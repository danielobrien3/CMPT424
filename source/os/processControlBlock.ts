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
            public Xreg: any = new Byte("00"),
            public Yreg: any = new Byte("00"),
            public Zflag: number = 0,
            public isExecuting: boolean = false,
            public state: string = "new",
            public currentSegment: any = MemorySegment,
            public quantumCount: number = 0){}

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

        public branchPC(val){
            if(this.pc + val > this.currentSegment.size){
                console.log(((val + this.pc) - this.currentSegment.size)-1);
                this.pc = ((val + this.pc) - this.currentSegment.size)-1;
            }else{
                console.log(this.pc + (val-1));
                this.pc += (val - 1);
            }


        }

        public kill(){
            this.isExecuting = false;
            this.state = "terminated";
        }

        // Updates pcb values to match cpu values. 
        public update(cpu){
            this.Acc = cpu.Acc;
            this.Xreg = cpu.Xreg;
            this.Yreg = cpu.Yreg;
            this.Zflag = cpu.Zflag;
        }

    }
}
