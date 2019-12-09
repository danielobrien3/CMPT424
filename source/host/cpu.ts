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
            pcb = _CpuScheduler.handleScheduling(pcb);
            this.currentProcess = pcb.pid;
            if(pcb != null && pcb.onDisk === false){
                this.setCPU(pcb);
                this.execute(pcb);
                Control.updateCpuDisplay(this);
                Control.updatePcbDisplay(pcb);
                Control.updateMemoryDisplay(); 
            }
        }

        public execute(pcb){
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
                    this.LDX(_MemoryAccessor.readAtLocation(pcb, logicalLocation));
                    break;
                }

                // Load Yreg with constant
                case "A0":{
                    this.LDY(_MemoryAccessor.readByte(pcb));
                    break;
                }

                // Load Yreg from memory
                case "AC":{
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.LDY(_MemoryAccessor.readAtLocation(pcb, logicalLocation));
                    break;
                }

                // CPX (Compare a byte in memory to Xreg. Set z flag to 0 if equal)
                case "EC": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.CPX(_MemoryAccessor.readAtLocation(pcb, logicalLocation));
                    break;
                }

                // BNE (Branch n bytes if zFlag == 0)
                // ## At this point I stopped making seperate function calls...
                // ## The heavy lifting will be done in the switch for the sake of getting project 2 in on time.
                // ## This will get refactored as mentioned at the beginning of this switch. 
                case "D0":{
                    if(this.Zflag == 0){
                        var branchAmount = _MemoryAccessor.readByte(pcb).getBaseTen();
                        pcb.branchPC(branchAmount);
                    }
                    break;
                } 

                // INC (Increment value of a byte in memory)
                case "EE":{
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    var byte = _MemoryAccessor.readAtLocation(pcb, logicalLocation)
                    _MemoryAccessor.write(pcb, logicalLocation, byte.increment());
                    break;
                }

                // System Call. This doesn't explicitly say to allow only one in the instruction set...
                // ... and I feel like it would make sense to let someone print both,
                // so i'm just gonna lean into it. No else statements. 
                case "FF":{
                    if(this.Xreg.isEqual(new Byte("01"))){
                        _StdOut.putText(this.Yreg.getBaseTen() + " ");
                    }
                    if(this.Xreg.isEqual(new Byte("02"))){
                        var currentLocation = this.Yreg;
                        var currentByte = _MemoryAccessor.readAtLocation(pcb, currentLocation.getBaseTen());
                        var string = "";
                        while(!currentByte.isEqual(new Byte("00"))){
                            string += String.fromCharCode(currentByte.getBaseTen());
                            currentLocation = currentLocation.increment();
                            currentByte = _MemoryAccessor.readAtLocation(pcb, currentLocation.getBaseTen());
                        }
                        _StdOut.putText(string);
                    }
                    break;
                }

                // Halt command
                case "00":{
                    this.BRK(pcb);
                    break;
                }
            }
            pcb.update(this);
            if(_CpuScheduler.currentAlgorithm === "RR"){
                pcb.quantumCount++;
            }
            this.PC = pcb.pc;
        }

        public startExecution(pcb){
            if(this.isExecuting){
                pcb.state = "ready";
            } else {
                console.log("starting execution for process <" + pcb.pid + ">");
                this.setCPU(pcb);
                this.currentProcess = pcb.pid;
                this.isExecuting = true;
                pcb.state = "executing";
            }
        }

        public setCPU(pcb){
            this.PC = pcb.PC
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        }

        public BRK(pcb){
            pcb.state = "completed";
            var nextProcess = _CpuScheduler.getNextProcess(pcb);
            if(nextProcess != null)
                this.currentProcess = nextProcess.pid;
            else
                this.isExecuting = false;
        }

        public LDA(byte){
            this.Acc = byte;
        }

        public ADC(byte){
            this.Acc = this.Acc.add(byte);
        }

        public LDX(byte){
            this.Xreg = byte;
        }

        public LDY(byte){
            this.Yreg = byte;
        }

        public CPX(byte){
            if(byte.isEqual(this.Xreg))
                this.Zflag = 1;
            else
                this.Zflag = 0;
        }

    }
}
