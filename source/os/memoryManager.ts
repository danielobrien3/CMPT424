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

            this.segments[0].init(0);
            this.segments[1].init(256);
            this.segments[2].init(512);
            this.processControlBlocks = new Array();
        }

        public findProcessById(id){
            // Finds process by id (duh). Pretty simple stuff. 
            for(var i = 0; i < this.processControlBlocks.length; i++){
               if(this.processControlBlocks[i].pid == id){
                   return this.processControlBlocks[i];
               }
           }
        }

        public getFreeSegment(){
            // getFreeSegment function handles finding free segment.
            // Returns first free segment found.
            // Since this will not necessarily be used for filling a segment, we will keep empty flag set true.
            
            for(var i=0; i<this.segments.length; i++){
                if(this.segments[i].empty == true){
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


        public newPcb(initialSegment, programLength){
            // Handles creating new new PCB and stores it in PCB array. 
            var tempPcb = new ProcessControlBlock();
            tempPcb.init(_PidCount, initialSegment.base, initialSegment.base + programLength, initialSegment);
            this.processControlBlocks.push(tempPcb);
            // Increments PidCount here to ensure that it is incremented every time a new process is created.
            _PidCount++;
            return this.processControlBlocks[this.processControlBlocks.length - 1];
        }
        
    }
}
