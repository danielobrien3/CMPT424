/* ------------
     Memory.ts

     Routines for the host.

     Memory Manager class handles finding free segments to be used by Memory Accessor. 
     This is where the segment class instanstiations are stored. 
     ------------ */

module TSOS {

    export class MemoryManager {

        constructor(public segments: any = new Array(),
                    public processControlBlocks: any = new Array()){}

        public init(){
            this.segments[0] = new TSOS.MemorySegment;
            this.segments[1] = new TSOS.MemorySegment;
            this.segments[2] = new TSOS.MemorySegment;

            this.segments[0].init(0, 255);
            this.segments[1].init(256, 511);
            this.segments[2].init(512, 767);
            this.processControlBlocks = new Array();
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


        public getSegment(base){
            // Handles getting and returning a specific segment based (no pun intended) on its base. 
            for(var i = 0; i<this.segments.length; i++){
                if(this.segments[i].getBase() == base){
                    return this.segments[i];
                }
            }
        }


        public newPcb(startLoc, endLoc){
            // Handles creating new new PCB and stores it in PCB array. 
            this.processControlBlocks.push(new ProcessControlBlock(startLoc, endLoc, _PidCount));
            // Increments PidCount here to ensure that it is incremented every time a new process is created.
            _PidCount++;
            return this.processControlBlocks[this.processControlBlocks.size];
        }
        
    }
}
