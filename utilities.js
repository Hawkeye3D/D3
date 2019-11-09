//Getting cycles to repeat
//Let's say you want the color cycle to repeat every 6 steps. How do you do it?
// The way I accomplish this is by using a frequency value which corresponds to 1/6th of 2π. 
//Remember that the sine wave repeats every 2π, so this will make the colors repeat every 6 increments. Here's the code...
// from https://krazydad.com/tutorials/makecolors.php
/**
 * 
 * @param {Centercolr} center 
 * @param {number less than center} width 
 * @param {number of non repeat colors to create} steps 
 * @param {total number of colors to make} numcolors 
 */
function cyclecolors(center,width,steps,numcolors){
    // let center = 128;
    // let width = 127;
    // let steps = 6;
    frequency = 2*Math.PI/steps;
    makeColorGradient(frequency,frequency,frequency,0,2,4,center,width,numcolors);
    }
    function phasecolors(f1,f2,f3,center,width,steps,numcolors){
      // let center = 128;
      // let width = 127;
      // let steps = 6;
      frequency = 2*Math.PI/steps;
      makeColorGradient(f1,f2,f3,0,2,4,center,width,numcolors);
      }