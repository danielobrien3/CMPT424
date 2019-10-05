/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: object = new Byte("00"),
                    public Xreg: object = new Byte("00"),
                    public Yreg: object = new Byte("00"),
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public currentProcess: number = 0) {}

        public init(): void {
            this.PC = 0;
            this.Acc = new Byte("00");
            this.Xreg = new Byte("00");
            this.Yreg = new Byte("00");
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentProcess = 0;

        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(_MemoryManager.findProcessById(this.currentProcess));


        }

        public execute(pcb){
            // Check to make sure "is executing" is false
            this.isExecuting = true;
            pcb.state = "running";
            this.currentProcess = pcb.pid;
            var byte = new Byte(_MemoryAccessor.read(pcb).value);
            switch(byte.value){
                // Load accumulator
                case "A9":{
                    this.LDA(_MemoryAccessor.read(pcb));
                    pcb.Acc = this.Acc;
                }
                // Store accumulator in memory
                case "8D":{
                    // Gets location value by using Byte function "calculateLocation". Byte declaration can be found in memory.ts file.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var logicalLocation = _MemoryAccessor.read(pcb).calculateLocation(_MemoryAccessor.read(pcb))
                    _MemoryAccessor.write(pcb, logicalLocation, this.Acc);
                }
                case "00":{
                    this.halt(pcb);
                }
            }
            this.PC = pcb.pc;
            Control.updatePcbDisplay(pcb);
        }

        public halt(pcb){
            this.isExecuting = false;
        }

        public LDA(byte){
            this.Acc = byte;

        }


    }
}
