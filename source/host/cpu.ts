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
                    public isExecuting: boolean = false) {}

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.


        }

        public execute(pcb){
            // Check to make sure "is executing" is false
            this.isExecuting = true;
            var byte = new Byte(_MemoryAccessor.read(pcb).value);
            switch(byte.value){
                // Load accumulator
                case "A9":{
                    this.LDA(_MemoryAccessor.read(pcb));
                }
                // Store accumulator in memory
                case "8D":{
                    // Gets location value by storing both bytes in a string, and then converting the string to base 10.
                    // This is the LOGICAL location, not physical. That is handled by the memoryAccessor.
                    var tempLocation = _MemoryAccessor.read(pcb).value + _MemoryAccessor.read(pcb).value;
                    var location = parseInt(tempLocation, 16);
                    _MemoryAccessor.write(pcb, location, this.Acc);
                }
            }

        }

        public LDA(byte){
            this.Acc = byte.value;
        }


    }
}
