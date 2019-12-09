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
            var process;
            for(var i = 0; i < this.processControlBlocks.length; i++){
               if(this.processControlBlocks[i].pid == id){
                   process = this.processControlBlocks[i];
               }
            }
            //If process is on disk, we must roll out/roll in
            if(process.onDisk){ 
                // Roll out the process one before the process being rolled in
                if(process.pid === 0){
                    this.rollOut(this.processControlBlocks[this.processControlBlocks.length-1].pid);
                    this.rollIn(process);
                } 
                else{ 
                    this.rollOut(process.pid - 1);
                    this.rollIn(process);
                }
                
            }

            return process;
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
            // Returns null if there are no free segments
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
            if(initialSegment === null){// If the initial segment is null then the process is being loaded onto the disk.
                tempPcb.init(_PidCount, null, null, null, true);
            } 
            else {
                tempPcb.init(_PidCount, initialSegment.base, initialSegment.base + programLength, initialSegment, false);
            }
            this.processControlBlocks.push(tempPcb);
            // Increments PidCount here to ensure that it is incremented every time a new process is created.
            _PidCount++;
            return this.processControlBlocks[this.processControlBlocks.length - 1];
        }

        public rollOut(pid){
            // Write process to disk
            var process = this.findProcessById(pid);
            var fileName = ".pid" + process.pid;
            var load = _krnDiskDriver.createFile(fileName);
            if(load !== false){
                var data = "";
                for(var i=0; i<(process.memEnd-process.memStart); i++){
                    data += _MemoryAccessor.readAtLocation(process, i).value;
                }
                _krnDiskDriver.writeToFile(fileName, data, true)
                console.log("rolling out process <" + pid + ">");
                process.rollOut(); // Handles resetting segment properties and setting onDisk to true
            } else {
                _StdOut.putText("Process swap failed due to problems with the disk drive.")
            }
        }

        public rollIn(process){
            // Find corresponding file and get data
            var fileName = ".pid"+ process.pid;
            var data = _krnDiskDriver.readFile(fileName);
            if(data !== false){
                // Trim data
                data = data.replace("00", "");

                // Get free segment and set process to use it
                var currentSegment = this.getFreeSegment();
                process.rollIn(currentSegment);

                // Write data to segment
                var byte: Byte;
                var dataCounter = 0;
                for(var i=0; i<currentSegment.size; i++){
                    if(i >= data.length){ // Fill bytes with 0 if there is no data to add from stored process
                        byte = new Byte("00");
                        _MemoryAccessor.write(process, i, byte);
                    }
                    else{
                        byte = new Byte(data.charAt(dataCounter) + "" + data.charAt(dataCounter+1));
                        _MemoryAccessor.write(process, i, byte);
                        dataCounter++;
                    }
                }
            }
            _krnDiskDriver.deleteFile(fileName);

            

        }
        
    }
}
