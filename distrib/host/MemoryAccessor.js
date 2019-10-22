/* ------------
     Memory.ts

     Routines for the host.

     Memory Accessor class handles deciding when loading, reading, writing, and emptying of data should be done.
     Actually loading, reading, etc. is handled in the memory class.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.load = function (program) {
            // Load handles loading program into memory.
            // Program should be loaded into a free segment
            var currentSegment = _MemoryManager.getFreeSegment();
            // Make sure program is not larger than segment size now, before any real work is done.
            if (currentSegment == null) {
                _Kernel.krnTrapError("There is no empty memory segment for this program to be loaded into.");
            }
            else {
                // getFreeSegment returns null if there are no free segments... 
                // ...therefore if currentSegment is null, we cannot continue loading the program. 
                if (program.length > currentSegment.limit) {
                    _Kernel.krnTrapError("Program is too large to be loaded into memory.");
                }
                else {
                    // Program is loaded into memory and a corresponding PCB is created. 
                    _Memory.load(currentSegment, program);
                    var pcb = _MemoryManager.newPcb(currentSegment, program.length);
                    currentSegment.setEmpty(false);
                    TSOS.Control.updateMemoryDisplay(pcb);
                    return pcb;
                }
            }
        };
        MemoryAccessor.prototype.readByte = function (pcb) {
            // Handles triggering memory read function for desired pcb. 
            var res = _Memory.read(pcb);
            pcb.pc++;
            return res;
        };
        // I feel like this is a little hacky, but this is used for updating the memory display.
        // Todo: have this operate off of a Byte? Not as simple as taking an int, but definitely more consistent. 
        MemoryAccessor.prototype.readAtLocation = function (pcb, logicalLocation) {
            var physicalLocation = pcb.memStart + logicalLocation;
            return _Memory.readAtLocation(physicalLocation);
        };
        MemoryAccessor.prototype.empty = function (pcb) {
            // Handles triggering memory.empty function for desired segment
            // Empties the pcb from memory using information from the pcb, then resets the pcb
            _Memory.empty(pcb);
        };
        MemoryAccessor.prototype.write = function (pcb, logicalLocation, newByte) {
            // Handles triggering memory.write function for desired segment, location, and byte
            // Find physical location here. 
            // TODO: Implement way to adjust size of resulting segment.
            // Physical location is found by simply adding logical location to the segment base. 
            var physicalLocation = pcb.memStart + logicalLocation;
            if (physicalLocation < pcb.currentSegment.limit) {
                // Makes sure that logical address is within program segment...
                // and check if the added byte increased the program size with assureSegmentSize.
                // If the logical location is greater than the segment size, the segment size will be updated. 
                _Memory.writeToLocation(physicalLocation, newByte);
                pcb.assureProcessSize(logicalLocation);
            }
            else {
                _Kernel.krnTrapError("Cannot write byte to location: " + physicalLocation + " because it is over the segment limit: " + pcb.currentSegment.limit);
            }
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
