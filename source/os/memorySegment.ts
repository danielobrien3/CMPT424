 /* ------------
     Memory.ts

     Routines for the host.

     Memory Segment class. No writing, reading, or loading should be handled here. 
     This holds information about segments to be used by memory accessor.
     ------------ */

module TSOS {

    export class MemorySegment {

        constructor(public empty: boolean = false,
                    public base: number = 0,
                    public limit: number = 0,
                    public size: number = 255) {}

        public init(base){
            this.empty = true;
            this.base = base;
            this.limit = base + 255;
        }

        public setEmpty(emptyFlag){
            // setEmpty handles segment empty flag 
            this.empty = emptyFlag;
        }
        
    }
}
