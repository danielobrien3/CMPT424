/* ------------
     Memory.ts

     Routines for the host.

     Memory Segment class. No writing, reading, or loading should be handled here.
     This holds information about segments to be used by memory accessor.
     ------------ */
var TSOS;
(function (TSOS) {
    var MemorySegment = /** @class */ (function () {
        function MemorySegment(empty, base, limit) {
            if (empty === void 0) { empty = false; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            this.empty = empty;
            this.base = base;
            this.limit = limit;
        }
        MemorySegment.prototype.init = function (base) {
            this.empty = true;
            this.base = base;
            this.limit = base + 255;
        };
        MemorySegment.prototype.setEmpty = function (emptyFlag) {
            // setEmpty handles segment empty flag and segment size being updated.
            this.empty = true;
        };
        return MemorySegment;
    }());
    TSOS.MemorySegment = MemorySegment;
})(TSOS || (TSOS = {}));
