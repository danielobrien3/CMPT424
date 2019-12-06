/* ------------
     Disk.ts

     Routines for the host.

     Disk memory class
     ------------ */
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(tracks, sectors, blocks, blockSize) {
            if (tracks === void 0) { tracks = 4; }
            if (sectors === void 0) { sectors = 8; }
            if (blocks === void 0) { blocks = 8; }
            if (blockSize === void 0) { blockSize = 64; }
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }
        Disk.prototype.format = function () {
            var data = "";
            for (var i = 0; i < this.blockSize; i++) {
                data += "00";
            }
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var str = t + ":" + s + ":" + b;
                        sessionStorage.setItem(str, data);
                    }
                }
            }
        };
        Disk.prototype.write = function (tsb, data) {
            while (data.length < charactersInBlock) {
                data += "00";
            }
            sessionStorage.setItem(tsb, data);
        };
        Disk.prototype.read = function (tsb) {
            return sessionStorage.getItem(tsb);
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
