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

        public empty(segment){
            // Handles triggering memory.empty function for desired segment
            _Memory.empty(segment);
        }

        public write(segment, logicalLocation, byte){
            // Handles triggering memory.write function for desired segment, location, and byte
            // Find physical location here. 
            // TODO: Implement way to adjust size of resulting segment.
            // Physical location is found by simply adding logical location to the segment base. 
            var physicalLocation = segment.base + physicalLocation;

             
            if(physicalLocation < segment.limit){
                // Makes sure that logical address is within program segment...
                // and check if the added byte increased the program size with assureSegmentSize.
                // assureSegmentSize adjusts size if necessary.
                _Memory.writeToLocation(segment, location, byte);
                _MemoryManager.assureSegmentSize(location);
            } else {
                _Kernel.krnTrapError("Cannot write byte to location: " + physicalLocation + " because it is over the segment limit: " + segment.limit);
            }
            
        }
    
    }
}
