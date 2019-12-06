///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public tsbList: Array<Tsb> = [new Tsb(false, "0:0:1", "0:0:1")]) {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.tsbList = [];
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        }

        public format(){
            _Disk.format();
            var counter = 0;
            for(var t=0; t<_Disk.tracks; t++){
                for(var s=0; s<_Disk.sectors; s++){
                    for(var b=0; b<_Disk.blocks; b++){
                        var str = t + ":" + s + ":" + b;
                        this.tsbList[counter] = new Tsb(false, str, null);
                        counter++;
                    }
                }
            }
            // set the mbr to inUse
            this.tsbList[0].setUse(true);
        }

        public createFile(fileName){
            // First get the file name in hex. 
            if(this.tsbList.length === 0){
                _StdOut.putText("Please format the disk and try again.");
                return false;
            }
            var fileNameHex = this.textToHex(fileName);
            // Then check if the file already exists
            for(var i=0; i<this.tsbList.length; i++){
                // The file must be in use and in the directory (sector 0) to already exist
                if(this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) === '0'){
                    if(_Disk.read(this.tsbList[i].location) === fileNameHex){
                        _StdOut.putText("Bad news: file " + fileName + " can't be created. Good news: it already exists.")
                        return false;
                    }
                }
            }

            var directoryBlock = null;
            var counter = 0;
            // Then find the next available directory entry we can store the file in. 
            while(directoryBlock===null && counter < this.tsbList.length){
                if(!this.tsbList[counter].inUse && this.tsbList[counter].location.charAt(2) === '0'){
                    directoryBlock = this.tsbList[counter];
                }
                counter++;
            }

            // Then create the file
            if(directoryBlock != null){
                _Disk.write(directoryBlock.location, fileNameHex);
                directoryBlock.inUse = true;
                _StdOut.putText("File " + fileName + " has been created.")
                return true;
            }
            else{
                _StdOut.putText("Bad news: File " + fileName + " could not be created because there is no free space in the file directory. Please format the drive before trying again.");
                return false;
            }
        }

        public writeToFile(fileName, data){
            // Determine how many blocks we need to write this data
            var blocksNeeded = Math.ceil(data.length / 64); 

            // Find open blocks to store data (if they exist)
            var openBlocks = new Array();
            for(var i=0; i<this.tsbList.length; i++){
                if(!this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) != '0'){
                    openBlocks.push(i);
                    if(openBlocks.length >= blocksNeeded){ // Leave the for loop once all necessary open blocks are found. 
                        i = this.tsbList.length;
                    }
                }
            }

            // Make sure necessary blocks were found
            if(openBlocks.length < blocksNeeded){
                _StdOut.putText("There is not enough available memory to write to this data.");
                return false;
            }
            
            // Find directory entry for file specified
            for(var i =0; i<this.tsbList.length; i++){
                if(this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) === '0')
            }

        }

        // Figured this was going to be needed often enough that making it its own function would be for the best. 
        public textToHex(text){
            var tempText = text.split("");
            var hex = ""
            for(var i=0; i<tempText.length; i++){
                hex += tempText[i].charCodeAt(0).toString(16);
            }
            return hex;
        }

    }
}


module TSOS {

    // Class represents a specific TSB. Track and Sector are used as values to help specify the TSB. 
    export class Tsb {

        // Every tracks' sector 0 is reserved for directory purposes.
        constructor(public inUse: boolean = false,
                    public location: string,
                    public next: string){}

        public setUse(bool){
            this.inUse = bool;
        }
        
    }
}

