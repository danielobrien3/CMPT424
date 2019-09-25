/* ------------
     Memory.ts

     Routines for the host.

     Memory Segment class. No writing, reading, or loading should be handled here.
     This holds information about segments to be used by memory accessor.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemorySegment = /** @class */ (function () {
        function MemorySegment() {
        }
        MemorySegment.prototype.init = function (base) {
            this.empty = true;
            this.base = base;
            this.limit = 255;
            this.size = 0;
        };
        MemorySegment.prototype.getBase = function () {
            return this.base;
        };
        MemorySegment.prototype.isEmpty = function () {
            // isEmpty handles returning segment's empty flag.
            return this.empty;
        };
        MemorySegment.prototype.setEmpty = function (emptyFlag) {
            // setEmpty handles segment empty flag and segment size being updated.
            this.empty = true;
            this.size = 0;
        };
        MemorySegment.prototype.write = function (location) {
            // Write handles writing a single byte into a single location in the segment.
            // Finding physical location 
            _Memory.load(this.base + location);
        };
        return MemorySegment;
    }());
    TSOS.MemorySegment = MemorySegment;
})(TSOS || (TSOS = {}));
