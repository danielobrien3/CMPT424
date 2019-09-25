/* ------------
     Memory.ts

     Routines for the host.

     Memory class should only load, write, and read programs. 
     All decisions regarding segments the program will utilize is done in memoryManager.
     All 
     ------------ */

module TSOS {

    export class Memory {

        constructor(private memory = new Array()) {
        }

        public init(): void {
            this.memory = new Array();
            this.size = 0;
        }

        public load(segment, program){
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            
            // need a load counter because base might not start at 0. 
            var loadCounter = 0;
            for(var i = segment.base; i<program.length; i++){
                memory[i] = program[loadCounter];
                loadCounter++;
            }
            size += program.length;
        }
        
        public write(location, byte){
            // Write function handles writing single bytes into memory
            // TODO: Handle how (more like where) to convert logical address into physical address. 
            memory[location] = byte;
        }

        public read(segment){
            // Read function handles reading and returning stored memory. 
            // Need a load counter because base might not start at 0.
            var loadCounter = 0;
            var readMemory = new Array();
            for(var i = segment.base; i<segment.size; i++){
                readMemory[i] = memory[i];
            }
            return readMemory;
        }

        public empty(segment){
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for(var i = segment.base; i < segment.size; i++){
                memory[i] = "OO";
            }
        }

    }
}
