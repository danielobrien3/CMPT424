/* ------------
     Memory.ts

     Routines for the host.

     Memory class should only load, write, and read programs. 
     All decisions regarding segments the program will utilize is done in memoryManager.
     All 
     ------------ */

module TSOS {

    export class Memory {

        constructor(public memory: any = new Array()) {}

        public init(): void {
            this.memory = new Array();
        }

        public load(segment, program){
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            
            // Need a load counter because segment base might be 0, so we can't use it as a program index.
            // Load counter makes sure we read from the 0 index of the program. 
            var loadCounter = 0;
            for(var i = segment.base; i<program.length; i++){
                this.memory[i] = new Byte(program[loadCounter]);
                loadCounter++;
            }
        }
        
        public writeToLocation(physicalLocation, newByte){
            // Write function handles writing single bytes into memory
            // Verbose name because apparently 'write' is a javascript keyword?
            this.memory[physicalLocation] = newByte;
        }

        public read(pcb){
            // Read function handles reading and returning stored memory. 
            // Increment pcb count here
            var tempResult = this.memory[pcb.pc];
            pcb.pc++;
        }

        public empty(segment){
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for(var i = segment.base; i < segment.base + segment.size; i++){
                this.memory[i] = new Byte("00");
            }
        }
    }

    // Byte class is 
    export class Byte {

        constructor(public value: string = "00"){}

        public setValue(newValue){
            this.value = newValue;
        }

        public getBaseTen(){
            // Handles returning the byte's hex value in base 10. 
            return parseInt(this.value, 16);
        }

        public increment(){
            // Handles incrementing the byte's hex value.
            // Stores decimal representation of byte value in temp then increments temp and converts it back. 
            // There may be a 'better' way to do this in hex, but I like how simple this is. 
            var temp = parseInt(this.value, 16);
            temp++;
            return temp.toString(16);
        }

    }

}
