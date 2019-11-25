/* ------------
     Disk.ts

     Routines for the host.

     Disk memory class
     ------------ */

module TSOS {

    export class Disk {

        
        constructor(public tracks: number = 4,
                    public sectors: number = 8,
                    public blocks: number = 8,
                    public blockSize: number = 64){}

        public init(): void {
            this.format("full")
        }

        public format(type){
            if(type === "full"){
                var data = "";
                for(var i=0; i<this.blockSize; i++){
                    data += "00";
                }
                for(var t=0; t<this.tracks; t++){
                    for(var s=0; s<this.sectors; s++){
                        for(var b=0; b<this.blocks; b++){
                            var str = t + ":" + s + ":" + b;
                            sessionStorage.setItem(str, data);
                        }
                    }
                }
            }
        }

        public write(tsb, data){
            sessionStorage.setItem(tsb, data);
        }
    }
}
