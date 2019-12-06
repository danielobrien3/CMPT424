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
            if (tsbList === void 0) { tsbList = [new TSOS.Tsb(false, "0:0:1", "0:0:1")]; }
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
        };
        DeviceDriverDisk.prototype.createFile = function (fileName) {
            // First get the file name in hex. 
            if (this.tsbList.length === 0) {
                _StdOut.putText("Please format the disk and try again.");
                return false;
            }
            var fileNameHex = this.textToHex(fileName);
            // Then check if the file already exists
            for (var i = 0; i < this.tsbList.length; i++) {
                // The file must be in use and in the directory (sector 0) to already exist
                if (this.tsbList[i].inUse && this.tsbList[i].location.charAt(2) === '0') {
                    if (_Disk.read(this.tsbList[i].location) === fileNameHex) {
                        _StdOut.putText("Bad news: file " + fileName + " can't be created. Good news: it already exists.");
                        return false;
                    }
                }
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
                _StdOut.putText("File " + fileName + " has been created.");
                return true;
            }
            else {
                _StdOut.putText("Bad news: File " + fileName + " could not be created because there is no free space in the file directory. Please format the drive before trying again.");
                return false;
            }
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
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
(function (TSOS) {
    // Class represents a specific TSB. Track and Sector are used as values to help specify the TSB. 
    var Tsb = /** @class */ (function () {
        // Size is 61 because theoretically the first byte is used to store "inUse" and the second and third byte stores "next".
        function Tsb(inUse, location, next) {
            if (inUse === void 0) { inUse = false; }
            this.inUse = inUse;
            this.location = location;
            this.next = next;
        }
        Tsb.prototype.setUse = function (bool) {
            this.inUse = bool;
        };
        return Tsb;
    }());
    TSOS.Tsb = Tsb;
})(TSOS || (TSOS = {}));
