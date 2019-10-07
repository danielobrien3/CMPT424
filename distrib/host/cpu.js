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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, currentProcess) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = new TSOS.Byte("00"); }
            if (Xreg === void 0) { Xreg = new TSOS.Byte("00"); }
            if (Yreg === void 0) { Yreg = new TSOS.Byte("00"); }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (currentProcess === void 0) { currentProcess = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentProcess = currentProcess;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = new TSOS.Byte("00");
            this.Xreg = new TSOS.Byte("00");
            this.Yreg = new TSOS.Byte("00");
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentProcess = 0;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var pcb = _MemoryManager.findProcessById(this.currentProcess);
            this.execute();
            TSOS.Control.updateCpuDisplay(this);
            TSOS.Control.updatePcbDisplay(pcb);
            TSOS.Control.updateMemoryDisplay(pcb);
            this.PC = pcb.pc;
        };
        Cpu.prototype.execute = function () {
            var pcb = _MemoryManager.findProcessById(this.currentProcess);
            var byte = new TSOS.Byte(_MemoryAccessor.readByte(pcb).value);
            //TODO: Refactor this switch statement. Each case should call its respective function passing just the pcb....
            // ... The heavy lifting should be done in the functions... cause otherwise there's no point in using them. 
            // ## ^^ tough love ##
            switch (byte.value) {
                // Load accumulator
                case "A9": {
                    this.LDA(_MemoryAccessor.readByte(pcb));
                    pcb.Acc = this.Acc;
                    break;
                }
                // Store accumulator in memory
                case "8D": {
                    // Gets location value by using Byte function "calculateLocation". Byte declaration can be found in memory.ts file.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    _MemoryAccessor.write(pcb, logicalLocation, this.Acc);
                    break;
                }
                // Add with carry
                case "6D": {
                    this.ADC(_MemoryAccessor.readByte(pcb));
                    pcb["break"];
                }
                // Load Xreg with constant 
                case "A2": {
                    this.LDX(_MemoryAccessor.readByte(pcb));
                    break;
                }
                // Load Xreg from Memory
                case "AE": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.LDX(_MemoryAccessor.readAtLocation(logicalLocation));
                    break;
                }
                // Load Yreg with constant
                case "A0": {
                    this.LDY(_MemoryAccessor.readByte(pcb));
                    break;
                }
                // Load Yreg from memory
                case "AC": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.LDY(_MemoryAccessor.readAtLocation(logicalLocation));
                    break;
                }
                // CPX (Compare a byte in memory to Xreg. Set z flag to 0 if equal)
                case "EC": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    this.CPX(_MemoryAccessor.readAtLocation(logicalLocation));
                    break;
                }
                // BNE (Branch n bytes if zFlag == 0)
                // ## At this point I stopped making seperate function calls...
                // ## The heavy lifting will be done in the switch for the sake of getting project 2 in on time.
                // ## This will get refactored as mentioned at the beginning of this switch. 
                case "DO": {
                    if (this.Zflag == 0) {
                        var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                        pcb.changePC(logicalLocation);
                    }
                    break;
                }
                // INC (Increment value of a byte in memory)
                case "EE": {
                    var logicalLocation = _MemoryAccessor.readByte(pcb).calculateLocation(_MemoryAccessor.readByte(pcb));
                    var byte = _MemoryAccessor.readAtLocation(logicalLocation);
                    _MemoryAccessor.write(pcb, logicalLocation, byte.increment());
                    break;
                }
                // System Call. This doesn't explicitly say to allow only one in the instruction set...
                // ... and I feel like it would make sense to let someone print both,
                // so i'm just gonna lean into it. No else statements. 
                case "FF": {
                    if (this.Xreg.isEqual(_MemoryAccessor.readAtLocation(1))) {
                        _StdOut.putText(this.Yreg.getBaseTen);
                    }
                    if (this.Xreg.isEqual(_MemoryAccessor.readAtLocation(2))) {
                        var currentByte = this.Yreg.calculateLocation(new TSOS.Byte("00"));
                        currentByte = _MemoryAccessor.readByte(currentByte);
                        var string = currentByte.value();
                        while (!currentByte.value.isEqual(new TSOS.Byte("00"))) {
                            currentByte = currentByte.increment();
                            string += currentByte = _MemoryAccessor.readByte(currentByte);
                        }
                        _StdOut.putText(string);
                    }
                    break;
                }
                // Halt command
                case "00": {
                    this.BRK(pcb);
                    break;
                }
            }
            pcb.update(this);
        };
        Cpu.prototype.startExecution = function (pcb) {
            this.setCPU(pcb);
            this.currentProcess = pcb.pid;
            this.isExecuting = true;
            pcb.state = "running";
        };
        Cpu.prototype.setCPU = function (pcb) {
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        };
        Cpu.prototype.BRK = function (pcb) {
            this.isExecuting = false;
        };
        Cpu.prototype.LDA = function (byte) {
            this.Acc = byte;
        };
        Cpu.prototype.ADC = function (byte) {
            this.Acc = this.Acc.add(byte);
        };
        Cpu.prototype.LDX = function (byte) {
            this.Xreg = byte;
        };
        Cpu.prototype.LDY = function (byte) {
            this.Yreg = byte;
        };
        Cpu.prototype.CPX = function (byte) {
            if (byte.equal(this.Xreg))
                this.Zflag = 1;
            else
                this.Zflag = 0;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
