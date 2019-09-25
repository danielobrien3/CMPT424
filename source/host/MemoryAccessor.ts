/* ------------
     Memory.ts

     Routines for the host.

     Memory Accessor class handles deciding when loading, reading, writing, and emptying of data should be done.
     Actually loading, reading, etc. is handled in the memory class.  
     ------------ */

module TSOS {

    export class MemoryAccessor {

        constructor() {}

        public load(program){
            // Load handles loading program into memory.
            // Program should be loaded into a free segment
            var currentSegment = _MemoryManager.getFreeSegment();

            // Make sure program is not larger than segment size now, before any real work is done.
            
            if(currentSegment == null){
                    _Kernel.krnTrapError("There is no empty memory segment for this program to be loaded into.");
            } else {

                // getFreeSegment returns null if there are no free segments... 
                // ...therefore if currentSegment is null, we cannot continue loading the program. 
                if(program.length > currentSegment.size){
                    _Kernel.krnTrapError("Program is too large to be loaded into memory.");
                } else {
                    _Memory.load(currentSegment.base, program);
                    currentSegment.setEmpty(false);
                    currentSegment.setSize(program.length);
                }
            }
        }

        public read(segment){
            // Handles triggering memory.read function for desired segment. 
            return _Memory.read(segment);
        }

        public empty(base){
            // Handles e
        }
    
    }
}
