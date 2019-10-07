/* ------------
 Shell.ts

 The OS Shell - The "command line interface" (CLI) for the console.

  Note: While fun and learning are the primary goals of all enrichment center activities,
        serious injuries may occur when trying to write your own Operating System.
 ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
  export class Shell {
      // Properties
      public promptStr = ">";
      public commandList = [];
      public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
      public apologies = "[sorry]";

      constructor() {
      }

      public init() {
          var sc: ShellCommand;
          //
          // Load the command list.

          // ver
          sc = new ShellCommand(this.shellVer,
                                "ver",
                                "- Displays the current version data.");
          this.commandList[this.commandList.length] = sc;

          // help
          sc = new ShellCommand(this.shellHelp,
                                "help",
                                "- This is the help command. Seek help.");
          this.commandList[this.commandList.length] = sc;

          // shutdown
          sc = new ShellCommand(this.shellShutdown,
                                "shutdown",
                                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
          this.commandList[this.commandList.length] = sc;

          // cls
          sc = new ShellCommand(this.shellCls,
                                "cls",
                                "- Clears the screen and resets the cursor position.");
          this.commandList[this.commandList.length] = sc;

          // man <topic>
          sc = new ShellCommand(this.shellMan,
                                "man",
                                "<topic> - Displays the MANual page for <topic>.");
          this.commandList[this.commandList.length] = sc;

          // trace <on | off>
          sc = new ShellCommand(this.shellTrace,
                                "trace",
                                "<on | off> - Turns the OS trace on or off.");
          this.commandList[this.commandList.length] = sc;

          // rot13 <string>
          sc = new ShellCommand(this.shellRot13,
                                "rot13",
                                "<string> - Does rot13 obfuscation on <string>.");
          this.commandList[this.commandList.length] = sc;

          // prompt <string>
          sc = new ShellCommand(this.shellPrompt,
                                "prompt",
                                "<string> - Sets the prompt.");
          this.commandList[this.commandList.length] = sc;

          // status <string>
          sc = new ShellCommand(this.shellStatus,
                                "status",
                                "<string> - Sets the current status. Also updates the date.");
          this.commandList[this.commandList.length] = sc;

          // date
          sc = new ShellCommand(this.shellDate,
                                "date",
                                "- Displays current date and time");
          this.commandList[this.commandList.length] = sc;

          // wherami
          sc = new ShellCommand(this.shellWhereAmI,
                                "whereami",
                                "- Displays user's current location");
          this.commandList[this.commandList.length] = sc;

          // greetings <string>
          sc = new ShellCommand(this.shellGreetings,
                                "greetings",
                                "<string> - Displays a greeting from the system");
          this.commandList[this.commandList.length] = sc;

          //Blue Screen of Death
          sc = new ShellCommand(this.shellBsod,
                                "bsod",
                                "- Displays a blue screen, informs user to restart system.");
          this.commandList[this.commandList.length] = sc;

          sc = new ShellCommand(this.shellLoadUserInput,
                                "load",
                                "- Validates and loads code found in User Program Input window");
          this.commandList[this.commandList.length] = sc;

          sc = new ShellCommand(this.shellRunProcess,
                                "run",
                                "<pid> - Runs process by process id (pid).");
          this.commandList[this.commandList.length] = sc;

          // ps  - list the running processes and their IDs
          // kill <id> - kills the specified process id.

          // Display the initial prompt.
          this.putPrompt();
      }

      public putPrompt() {
          _StdOut.putText(this.promptStr);
      }

      // automplete is a boolean paramater used to decide how to handle input
      public handleInput(buffer, autocomplete) {
          _Kernel.krnTrace("Shell Command~" + buffer);
          //
          // Parse the input...regklmsdfklmdsf  
          //
          var userCommand = this.parseInput(buffer);
          // ... and assign the command and args to local variables.
          var cmd = userCommand.command;
          var args = userCommand.args;
          //
          // Determine the command and execute it.
          //
          // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
          // command list in attempt to find a match. 
          // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
          var index: number = 0;
          var found: boolean = false;
          var fn = undefined;
          var cmdHits = [];

          if(autocomplete === true){
              // Check for potential autocomplete commands by slicing each index to length of user command
              // Store hits in array, check length after to decide whether to execute command recursively or to display potential Cmds
              for (var i =0; i < this.commandList.length; i++) {
                  var tempCmd = this.commandList[i].command.slice(0, cmd.length)
                  if(tempCmd === cmd){
                      cmdHits.push(this.commandList[i])
                      found = true;
                  }
              }
          } else { //Full command was (at least attempted to be) provided
              while (!found && index < this.commandList.length) {
                  console.log("" + this.commandList[index].command +"" + " buffer: " + "" +cmd+"");
                  console.log(this.commandList[index].command === cmd);
                  if (this.commandList[index].command === cmd) {
                      found = true;
                      fn = this.commandList[index].func;
                  } else {
                      ++index;
                  }
              }
          }
          // Check how many elements are in cmdHits...
          // ... multiple elements means the provided cmd wasn't unique enough, return all possible commands.
          // ... one hit means the provided cmd was unique enough, print the function
          // ... no hits means autocomplete is false, execute the function
          console.log(found);
          if (found) {
              if(cmdHits.length > 1){
                  var cmdListString = "";
                  for(var i=0; i<cmdHits.length; i++){
                      cmdListString += cmdHits[i].command;
                      cmdListString += "    ";
                  }
                  _StdOut.advanceLine();
                  _StdOut.putText(cmdListString);
              }
              if(cmdHits.length == 1){
                  var cmdHit = cmdHits[0];
                  var remainingCmd = cmdHit.command.substring(cmd.length, cmdHit.length);
                  _StdOut.putText(remainingCmd);
                  return remainingCmd;
              } else {
                  this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
              }
              
          } else {
              // It's not found, so check for curses and apologies before declaring the command invalid.
              if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                  this.execute(this.shellCurse);
              } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                  this.execute(this.shellApology);
              } else { // It's just a bad command. {
                  this.execute(this.shellInvalidCommand);
              }
          }
      }

      // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
      public execute(fn, args?) {
          // We just got a command, so advance the line...
          _StdOut.advanceLine();
          // ... call the command function passing in the args with some über-cool functional programming ...
          fn(args);
          // Check to see if we need to advance the line again
          if (_StdOut.currentXPosition > 0) {
              _StdOut.advanceLine();
          }
          // ... and finally write the prompt again.
          this.putPrompt();
      }

      public parseInput(buffer: string): UserCommand {
          var retVal = new UserCommand();

          // 1. Remove leading and trailing spaces.
          buffer = Utils.trim(buffer);

          // 2. Lower-case it.
          buffer = buffer.toLowerCase();

          // 3. Separate on spaces so we can determine the command and command-line args, if any.
          var tempList = buffer.split(" ");

          // 4. Take the first (zeroth) element and use that as the command.
          var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
          // 4.1 Remove any left-over spaces.
          cmd = Utils.trim(cmd);
          // 4.2 Record it in the return value.
          retVal.command = cmd;

          // 5. Now create the args array from what's left.
          for (var i in tempList) {
              var arg = Utils.trim(tempList[i]);
              if (arg != "") {
                  retVal.args[retVal.args.length] = tempList[i];
              }
          }
          return retVal;
      }

      //
      // Shell Command Functions. Kinda not part of Shell() class exactly, but
      // called from here, so kept here to avoid violating the law of least astonishment.
      //
      public shellInvalidCommand() {
          _StdOut.putText("Invalid Command. ");
          if (_SarcasticMode) {
              _StdOut.putText("Unbelievable. You, [subject name here],");
              _StdOut.advanceLine();
              _StdOut.putText("must be the pride of [subject hometown here].");
          } else {
              _StdOut.putText("Type 'help' for, well... help.");
          }
      }

      public shellCurse() {
          _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
          _StdOut.advanceLine();
          _StdOut.putText("Bitch.");
          _SarcasticMode = true;
      }

      public shellApology() {
         if (_SarcasticMode) {
            _StdOut.putText("I think we can put our differences behind us.");
            _StdOut.advanceLine();
            _StdOut.putText("For science . . . You monster.");
            _SarcasticMode = false;
         } else {
            _StdOut.putText("For what?");
         }
      }

      // Although args is unused in some of these functions, it is always provided in the 
      // actual parameter list when this function is called, so I feel like we need it.

      public shellVer(args: string[]) {
          _StdOut.putText(APP_NAME + " version " + APP_VERSION);
      }

      public shellHelp(args: string[]) {
          _StdOut.putText("Commands:");
          for (var i in _OsShell.commandList) {
              _StdOut.advanceLine();
              _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
          }
      }

      public shellShutdown(args: string[]) {
           _StdOut.putText("Shutting down...");
           // Call Kernel shutdown routine.
          _Kernel.krnShutdown();
          // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
      }

      public shellCls(args: string[]) {         
          _StdOut.clearScreen();     
          _StdOut.resetXY();
      }

      public shellMan(args: string[]) {
          if (args.length > 0) {
              var topic = args[0];
              switch (topic) {
                  case "help":
                      _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                      break;
                  // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                  default:
                      _StdOut.putText("No manual entry for " + args[0] + ".");
              }
          } else {
              _StdOut.putText("Usage: man <topic>  Please supply a topic.");
          }
      }

      public shellTrace(args: string[]) {
          if (args.length > 0) {
              var setting = args[0];
              switch (setting) {
                  case "on":
                      if (_Trace && _SarcasticMode) {
                          _StdOut.putText("Trace is already on, doofus.");
                      } else {
                          _Trace = true;
                          _StdOut.putText("Trace ON");
                      }
                      break;
                  case "off":
                      _Trace = false;
                      _StdOut.putText("Trace OFF");
                      break;
                  default:
                      _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
              }
          } else {
              _StdOut.putText("Usage: trace <on | off>");
          }
      }

      public shellRot13(args: string[]) {
          if (args.length > 0) {
              // Requires Utils.ts for rot13() function.
              _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
          } else {
              _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
          }
      }

      public shellPrompt(args: string[]) {
          if (args.length > 0) {
              _OsShell.promptStr = args[0];
          } else {
              _StdOut.putText("Usage: prompt <string>  Please supply a string.");
          }
      }

      public shellStatus(args: string[]){
          if (args.length > 0){
              var status = "";
              for(var i =0; i<args.length; i++){
                  status += args[i];
                  status += " ";
              }
              Control.graphicTaskBarUpdate(status);
          }
          else{
              _StdOut.putText("Usage: status <string>  Please supply a string.");
          }
      }

      public shellDate(args: string[]){
          _StdOut.putText(Date());
      }

      public shellWhereAmI(args: string[]){
          _StdOut.putText("Your happy place! (hopefully...)");
      }

      public shellGreetings(args: string[]){
          if (args.length >0){
              _StdOut.putText("Hello " + args + ", you must be lonely, huh?");
          }
          else{
              _StdOut.putText("Hello, maybe next time try putting your name!");
          }
      }

      public shellBsod(args: string[]){
          _StdOut.blueScreen();
          _StdOut.putText("Error # (insert error here) has crashed the system.")
          _StdOut.advanceLine();
          _StdOut.putText("Please restart the console to use it further...");
          this.shellPrompt(['...']);
      }

      public shellLoadUserInput(args: string[]){
          var valid = Control.validateUserProgramInput();

          if (valid){
            // Load the program. _MemoryAcessor.load handles all loading requirements...
            //... including finding an available segment, creating new PCB, etc. 
            var program = Control.loadUserInput();
            var pcb = _MemoryAccessor.load(program);

            // If the program runs into an error being loaded my the memory accessor, it will return null...
            // ... therefore we should only print if it is not null. 
            if(pcb != null){
              _StdOut.putText("PID: " + pcb.pid);
              Control.displayPcb(pcb);
            }
            
          } 
          else {
            _StdOut.putText("Your code is invalid. Please use only hex digits and spaces.");
          }
      }

      public shellRunProcess(args: string[]){
        if(args.length>0){
          _CPU.startExecution(_MemoryManager.findProcessById(args[0]));
        }
      }

  }
}
