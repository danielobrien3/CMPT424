/* ------------
     Memory.ts

     Routines for the host.

     Memory class should only load, write, and read programs. 
     All decisions regarding segments the program will utilize is done in memoryManager.
     All 
     ------------ */

module TSOS {

    export class Memory {

        constructor(public mem: Array<Byte> = [new Byte()]){}

        public init(): void {
            this.mem = new Array();
            for(var i=0; i< 767; i++){
                this.mem.push(new Byte("00"));
            }
            Control.generateMemoryDisplay();
        }

        public load(segment, program){
            // Load function for loading program into memory...
            // ...program parameter is an array passed by memory manager. 
            // ...memory manager must decide where to store program.
            
            // Need a load counter because segment base might be 0, so we can't use it as a program index.
            // Load counter makes sure we read from the 0 index of the program. 

            var loadCounter = 0;
            for(var i = segment.base; i<program.length; i++){
                this.mem[i] = new Byte(program[loadCounter].toUpperCase());
                loadCounter++;
            }

        }
        
        public writeToLocation(physicalLocation, newByte){
            // Write function handles writing single bytes into mem
            // Verbose name because apparently 'write' is a javascript keyword?
            this.mem[physicalLocation] = newByte;
        }

        public read(pcb){
            // Read function handles reading and returning stored mem. 
            // The byte is stored in a temp variable so program counter can increment here
            var tempByte = this.mem[pcb.pc];
            return tempByte;
        }

        public readAtLocation(physicalLocation){
            return this.mem[physicalLocation];
        }

        public empty(pcb){
            // Function that handles emptying a segment 
            // 'Empties' by filling segment with break commands. 
            for(var i = pcb.segment.base; i < pcb.segment.limit; i++){
                this.mem[i] = new Byte("00");
            }
            pcb.setEmpty();

        }
    }

}

module TSOS {
    export class Byte {

        constructor(public value: string = "00"){}

        //TODO: Write a function that adds a second byte value to this byte value...
        //... and returns the sum parsed into decimal. 
        // |This will be used for converting provided memory values to decimal|

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

        // Add 2 bytes and return them as byte value
        public add(byte){
            var temp = this.getBaseTen() + byte.getBaseTen()
            return temp.toString(this.value, 16);
        }

        public calculateLocation(byte){
            // Takes two bytes, adds them together, and converts to base 10. 
            // This is for getting a memory location value as they are provided in the opcode expressions. 
            var location = byte.value + this.value;
            return parseInt(location, 16);
        }

    }
}
