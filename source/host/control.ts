/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        // Updates status of task bar. Also updates current Date Time in task bar. 
        public static graphicTaskBarUpdate(status){
            var date: string = Date();

            var taskBar = <HTMLInputElement> document.getElementById("graphicTaskBar");
            taskBar.value = date + "\n" + "Status: " + status;
        }


        // Validates user input from User Program Input
        // ...must be hex digits and spaces to be accepted
        public static validateUserProgramInput(){
            var userInputElement = <HTMLInputElement> document.getElementById("taProgramInput");
            var userInput = userInputElement.value;

            var valid = true;
            var index = 0;
            var char = 0;

            while(valid == true && index < userInput.length){
                char = userInput.charCodeAt(index);
                index++;
                if((char >= 97 && char <= 102) ||
                    (char >= 65 && char <= 70) ||
                    (char >= 48 && char <= 57) ||
                    (char == 32))
                {
                    valid = true;
                } else{
                    valid = false;
                }
            }
            return valid;
        }

        public static loadUserInput(){
            // Handles loading user input. Returns input as an array of bytes. 
            var userInputElement = <HTMLInputElement> document.getElementById("taProgramInput");
            return userInputElement.value.split(" ");
        }

        public static displayPcb(pcb){
            // Handles creating a new table row to display newly loaded process. 
            var pcbTable = <HTMLTableElement> document.getElementById("pcbTable");
            var newRow = pcbTable.insertRow(1);
            var pid = newRow.insertCell(0);
            var pc = newRow.insertCell(1);
            var ir = newRow.insertCell(2);
            var acc = newRow.insertCell(3);
            var state = newRow.insertCell(4);
            var xReg = newRow.insertCell(5);
            var yReg = newRow.insertCell(6);
            var zFlag = newRow.insertCell(7);

            // Everything except for pc and state are stored as bytes.
            // Their values are "hex" strings so that's what we'll use. 
            pid.innerHTML = pcb.pid;
            pc.innerHTML = pcb.pc.toString();
            ir.innerHTML = pcb.instrReg.value;
            acc.innerHTML = pcb.Acc.value;
            state.innerHTML = pcb.state;
            xReg.innerHTML = pcb.Xreg.value;
            yReg.innerHTML = pcb.Yreg.value;
            zFlag.innerHTML = pcb.Zflag;
        }

        public static updatePcbDisplay(pcb){
            var table = <HTMLTableElement> document.getElementById("pcbTable");
            
            for(var r=0; r<table.rows.length; r++){
                if((pcb.pid == parseInt(table.rows[r].cells[0].innerHTML))){
                    table.rows[r].cells[1].innerHTML = pcb.pc.toString();
                    table.rows[r].cells[2].innerHTML = pcb.instrReg.value;
                    table.rows[r].cells[3].innerHTML = pcb.Acc.value;
                    table.rows[r].cells[4].innerHTML = pcb.state;
                    table.rows[r].cells[5].innerHTML = pcb.Xreg.value;
                    table.rows[r].cells[6].innerHTML = pcb.Yreg.value;
                    table.rows[r].cells[7].innerHTML = pcb.Zflag;
                }
            }            
        }

        public static updateCpuDisplay(cpu){
            var table = <HTMLTableElement> document.getElementById("cpuTable");
            
            table.rows[1].cells[0].innerHTML = cpu.PC;
            table.rows[1].cells[1].innerHTML = cpu.Acc.value;
            table.rows[1].cells[2].innerHTML = cpu.Xreg.value;
            table.rows[1].cells[3].innerHTML = cpu.Yreg.value;
            table.rows[1].cells[4].innerHTML = cpu.Zflag;
            table.rows[1].cells[5].innerHTML = cpu.isExecuting;
        }

        //TODO: Create generateSegmentDisplay(base) function and give each segment its own gui tab.
        public static generateMemoryDisplay(){ 
            var table = <HTMLTableElement> document.getElementById("memTable");
            for(var i=0; i<96; i++){
                var row = table.insertRow(i);
                var cell0 = row.insertCell(0);
                cell0.innerHTML = "0x" + (8 * i).toString(16).toUpperCase();
                for(var j=1; j<9; j++){
                    var cellJ = row.insertCell(j);
                    cellJ.innerHTML = "00";
                }
            }
        }

        public static updateMemoryDisplay(pcb){
            var segment = pcb.currentSegment;
            var table = <HTMLTableElement> document.getElementById("memTable");
            for(var r=segment.base; r<segment.limit/8; r++){
                var row = table.rows[r]
                for(var c=1; c<8; c++){
                    var cell = row.cells[c];
                    cell.innerHTML = _MemoryAccessor.readAtLocation((r * 8) + (c-1)).value;
                }
            }
            
        }



        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // Display date and default status
            (<HTMLInputElement> document.getElementById("graphicTaskBar")).value = Date() + "\n" + "Status: Just getting Started";


            // Create and Initialize Memory and Memory Accessor
            _Memory = new Memory();
            _Memory.init();
            
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.


            _MemoryAccessor = new MemoryAccessor();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
}
