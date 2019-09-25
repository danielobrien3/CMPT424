/* ------------
     Memory.ts

     Routines for the host.

     Memory Segment class. No writing, reading, or loading should be handled here. 
     This holds information about segments to be used by memory accessor.
     ------------ */

module TSOS {

    export class MemorySegment {

        constructor() {}

        public init(base){
            this.empty = true;
            this.base = base;
            this.limit = 255;
            this.size = 0;
        }

        public setEmpty(emptyFlag){
            // setEmpty handles segment empty flag and segment size being updated.
            this.empty = true;
            this.size = 0;
        }
        
    }
}
