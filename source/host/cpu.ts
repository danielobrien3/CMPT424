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
                    public Acc: any = new Byte("00"),
                    public Xreg: any = new Byte("00"),
                    public Yreg: any = new Byte("00"),
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
            var pcb = _MemoryManager.findProcessById(this.currentProcess)
            this.execute(pcb);
            Control.updateCpuDisplay(pcb);
            Control.updatePcbDisplay(pcb);
            Control.updateMemoryDisplay(pcb);
            this.PC = pcb.pc;
        }

        public execute(pcb){
            // Check to make sure "is executing" is false
            this.isExecuting = true;
            pcb.state = "running";
            this.currentProcess = pcb.pid;
            var byte = new Byte(_MemoryAccessor.readByte(pcb).value);

            //TODO: Refactor this switch statement. Each case should call its respective function passing just the pcb....
            // ... The heavy lifting should be done in the functions... cause otherwise there's no point in using them. 
            // ## ^^ tough love ##
            switch(byte.value){
                // Load accumulator
                case "A9":{
                    this.LDA(_MemoryAccessor.readByte(pcb));
                    pcb.Acc = this.Acc;
                    break;
                }
                // Store accumulator in memory
                case "8D":{
                    // Gets location value by using Byte function "calculateLocation". Byte declaration can be found in memory.ts file.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb))
                    _MemoryAccessor.write(pcb, logicalLocation, this.Acc);
                    break;
                }
                // Add with carry
                case "6D":{
                    this.ADC(_MemoryAccessor.readByte(pcb));
                    break;
                }

                // Load Xreg with constant 
                case "A2":{
                    this.LDX(_MemoryAccessor.readByte(pcb));
                    break;
                }

                // Load Xreg from Memory
                case "AE":{
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.LDX(_MemoryAccessor.readAtLocation(logicalLocation));
                }

                // Load Yreg with constant
                case "A0":{
                    this.LDY(_MemoryAccessor.readByte(pcb));
                    break;
                }

                // Load Yreg from memory
                case "AC":{
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.LDY(_MemoryAccessor.readAtLocation(logicalLocation));
                }

                // CPX (Compare a byte in memory to Xreg. Set z flag to 0 if equal)
                case "EC": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.CPX(_MemoryAccessor.readAtLocation(logicalLocation));
                }

                // BNE (Branch n bytes if zFlag == 0)
                // ## At this point I stopped making seperate function calls...
                // ## The heavy lifting will be done in the switch for the sake of getting project 2 in on time.
                // ## This will get refactored as mentioned at the beginning of this switch. 
                case "DO":{
                    if(this.Zflag == 0){
                        var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                        pcb.changePC(logicalLocation);
                    }
                } 

                // INC (Increment value of a byte in memory)
                case "EE":{
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    _MemoryAccessor.write(pcb, logicalLocation, _MemoryAccessor.readAtLocation(logicalLocation).increment());
                }

                // Halt command
                case "00":{
                    this.BRK(pcb);
                    break;
                }

            }
        }

        public BRK(pcb){
            this.isExecuting = false;
        }

        public LDA(byte){
            this.Acc = byte;
        }

        public ADC(byte){
            console.log(byte);
            this.Acc = this.Acc.add(byte);
        }

        public LDX(byte){
            this.Xreg = byte;
        }

        public LDY(byte){
            this.Yreg = byte;
        }

        public CPX(byte){
            if(byte.equal(this.Xreg))
                this.Zflag = 1;
            else
                this.Zflag = 0;
        }

    }
}
