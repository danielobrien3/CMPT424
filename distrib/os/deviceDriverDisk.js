///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverDisk = /** @class */ (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk(tsbList) {
            // Override the base method pointers.
            if (tsbList === void 0) { tsbList = [new TSOS.Tsb(false, null, null)]; }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.tsbList = tsbList;
            _this.tsbList = [];
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        };
        DeviceDriverDisk.prototype.format = function () {
            _Disk.format();
            var counter = 0;
            for (var t = 0; t < _Disk.tracks; t++) {
                for (var s = 0; s < _Disk.sectors; s++) {
                    for (var b = 0; b < _Disk.blocks; b++) {
                        var str = t + ":" + s + ":" + b;
                        this.tsbList[counter] = new TSOS.Tsb(false, str, null);
                        counter++;
                    }
                }
            }
            // set the mbr to inUse
            this.tsbList[0].setUse(true);
            TSOS.Control.generateDiskDisplay();
        };
        DeviceDriverDisk.prototype.createFile = function (fileName) {
            // First get the file name in hex. 
            if (this.tsbList.length === 0) {
                _StdOut.putText("Please format the disk and try again.");
                return false;
            }
            var fileNameHex = this.textToHex(fileName);
            // Then check if the file already exists
            if (this.findFile(fileName)) {
                _StdOut.putText("Bad news: file " + fileName + " can't be created. Good news: it already exists.");
                return false;
            }
            var directoryBlock = null;
            var counter = 0;
            // Then find the next available directory entry we can store the file in. 
            while (directoryBlock === null && counter < this.tsbList.length) {
                if (!this.tsbList[counter].inUse && this.tsbList[counter].location.charAt(2) === '0') {
                    directoryBlock = this.tsbList[counter];
                }
                counter++;
            }
            // Then create the file
            if (directoryBlock != null) {
                _Disk.write(directoryBlock.location, fileNameHex);
                directoryBlock.inUse = true;
                if (fileName.charAt(0) !== ".") {
                    _StdOut.putText("File " + fileName + " has been created.");
                    TSOS.Control.generateDiskDisplay();
                }
                return true;
            }
            else {
                _StdOut.putText("Bad news: File " + fileName + " could not be created because there is no free space in the file directory. Please format the drive before trying again.");
                return false;
            }
        };
        DeviceDriverDisk.prototype.writeToFile = function (fileName, data) {
            // Determine how many blocks we need to write this data
            var blocksNeeded = Math.ceil(data.length / 64);
            // Find open blocks to store data (if they exist)
            var openBlocks = new Array();
            for (var i = 0; i < this.tsbList.length; i++) {
                if (!this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) != '0') {
                    openBlocks.push(this.tsbList[i]);
                    if (openBlocks.length >= blocksNeeded) { // Leave the for loop once all necessary open blocks are found. 
                        i = this.tsbList.length;
                    }
                }
            }
            // Make sure necessary blocks were found
            if (openBlocks.length < blocksNeeded) {
                _StdOut.putText("There is not enough available memory to write to this data.");
                return false;
            }
            // Find directory entry for file specified
            var directoryEntry = this.findFile(fileName);
            if (directoryEntry === null) {
                _StdOut.putText("The file you tried writing to does not exist");
                return false;
            }
            // Break up data into block-sized pieces.
            var splitData = new Array();
            for (var i = 0; i < blocksNeeded; i++) {
                var sliceBegin = i * charactersInBlock;
                // If i + 1 is === blocksNeeded, then we need to slice at the end of the data.
                var sliceEnd;
                if (i + 1 === blocksNeeded) {
                    sliceEnd = data.length;
                }
                else {
                    sliceEnd = (i + 1) * charactersInBlock;
                }
                splitData.push(data.slice(sliceBegin, sliceEnd));
            }
            // Set linking for blocks
            directoryEntry.setNext(openBlocks[0]);
            if (blocksNeeded > 1) {
                for (var i = 0; i < blocksNeeded; i++) {
                    if (i + 1 < blocksNeeded) {
                        openBlocks[i].setNext(openBlocks[i + 1]);
                    }
                }
            }
            // Write data to blocks
            for (var i = 0; i < splitData.length; i++) {
                _Disk.write(openBlocks[i].location, this.textToHex(splitData[i]));
            }
            TSOS.Control.generateDiskDisplay();
        };
        // Figured this was going to be needed often enough that making it its own function would be for the best. 
        DeviceDriverDisk.prototype.textToHex = function (text) {
            var tempText = text.split("");
            var hex = "";
            for (var i = 0; i < tempText.length; i++) {
                hex += tempText[i].charCodeAt(0).toString(16);
            }
            return hex;
        };
        // Another thing that will be needed often enough to be abstracted out to its own function. 
        DeviceDriverDisk.prototype.findFile = function (fileName) {
            // Make provided file name match what is stored in data...
            // ... this means converting it to hex and extending it to 64 bytes.
            var tempFileName = this.textToHex(fileName);
            while (tempFileName.length < charactersInBlock) {
                tempFileName += "00";
            }
            for (var i = 0; i < this.tsbList.length; i++) {
                if (this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) === "0") {
                    if (tempFileName === _Disk.read(this.tsbList[i].location)) {
                        return this.tsbList[i];
                    }
                }
            }
            return null;
        };
        DeviceDriverDisk.prototype.readFile = function (fileName) {
            var file = this.findFile(fileName);
            // Make sure file exists...
            if (file === null) {
                _StdOut.putText("File <" + fileName + "> does not exist.");
                return false;
            }
            // Make sure file has data written to it
            if (file.next === null) {
                _StdOut.putText("File <" + fileName + "> has no data written to it");
                return false;
            }
            // Loop through file-links getting data
            var data = "";
            while (file.next != null) {
                file = file.next;
                data += _Disk.read(file.location);
            }
            return data;
        };
        DeviceDriverDisk.prototype.deleteFile = function (fileName) {
            var file = this.findFile(fileName);
            // Make sure file exists
            if (file === null) {
                _StdOut.putText("File <" + fileName + "> does not exist.");
                return false;
            }
            // Get all linked blocks
            var blocks = [];
            blocks.push(file);
            while (file.next != null) {
                file = file.next;
                blocks.push(file);
            }
            // Set all linked blocks to not inUse and no next
            for (var i = 0; i < blocks.length; i++) {
                blocks[i].setUse(false);
                blocks[i].unlinkNext();
                ;
            }
            if (fileName.charAt(0) !== ".") {
                _StdOut.putText("File <" + fileName + "> has been deleted");
                TSOS.Control.generateDiskDisplay();
            }
        };
        DeviceDriverDisk.prototype.listFiles = function () {
            for (var i = 0; i < this.tsbList.length; i++) {
                var file = this.tsbList[i];
                if (file.inUse && file.location.charAt(2) === '0') { //Only get in use directory entries
                    var fileName = this.convertFromHex(_Disk.read(file.location));
                    if (fileName.charAt(0) != "." && file.location != "0:0:0") { // Ignore hidden files and MBR
                        _StdOut.putText(fileName + " ");
                    }
                }
            }
        };
        DeviceDriverDisk.prototype.convertFromHex = function (data) {
            // Trim data...
            data = data.replace("00", "");
            var convertedData = "";
            for (var i = 0; i < data.length; i += 2) {
                var byte = data.charAt(i) + data.charAt(i + 1);
                var decimalValue = parseInt(byte, 16);
                convertedData += String.fromCharCode(decimalValue);
            }
            return convertedData;
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
(function (TSOS) {
    // Class represents a specific TSB. Track and Sector are used as values to help specify the TSB. 
    var Tsb = /** @class */ (function () {
        // Every tracks' sector 0 is reserved for directory purposes.
        function Tsb(inUse, location, next) {
            if (inUse === void 0) { inUse = false; }
            if (next === void 0) { next = null; }
            this.inUse = inUse;
            this.location = location;
            this.next = next;
        }
        Tsb.prototype.setUse = function (bool) {
            this.inUse = bool;
        };
        Tsb.prototype.setNext = function (tsb) {
            this.next = tsb;
            this.next.setUse(true);
        };
        Tsb.prototype.unlinkNext = function () {
            this.next = null;
        };
        return Tsb;
    }());
    TSOS.Tsb = Tsb;
})(TSOS || (TSOS = {}));
