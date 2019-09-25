/* ------------
     Memory.ts

     Routines for the host.

     Memory Manager class handles finding free segments to be used by Memory Accessor. 
     This is where the segment class instanstiations are stored. 
     ------------ */

module TSOS {

    export class MemoryManager {

        constructor(public segments = new Array()){}

        public init(){
            this.segments[0] = new TSOS.memorySegment;
            this.segments[1] = new TSOS.memorySegment;
            this.segments[2] = new TSOS.memorySegment;

            this.segments[0].init(0, 255);
            this.segments[1].init(256, 511);
            this.segments[2].init(512, 767);
        }

        public getFreeSegment(){
            // getFreeSegment function handles finding free segment.
            // Returns first free segment found.
            // Since this will not necessarily be used for filling a segment, we will keep empty flag set true.
            for(var i=0; i<this.segments.length; i++){
                if(this.segments[i].isEmpty == true){
                    return this.segments[i];
                }
            }
            // Returns null if there are no free segments.
            return null;
        }

        // TODO: Put this in memory accessor.
        public emptySegment(base){
            // emptySegment function handles emptying segment starting at the base provided.
            // Since this will only be used to empty segment (duh), we will set empty flag to true.
            var segment = this.getSegment(base);
            _Memory.empty(segment.base, segment.size);
            segment.setEmpty(true);
        }

        public getSegment(base){
            // Handles getting and returning a specific segment based (no pun intended) on its base. 
            for(var i = 0; i<this.segments.length; i++){
                if(segments[i].getBase() == base){
                    return this.segments[i];
                }
            }
        }

        
    }
}
