/**
 * Event Bus - Gift with Purchase
 * - This additional eventbus is required for the GWP,
 * as it must be initiated before the theme.js file.
 */
 function eventBusGwp(){const n={};return Object.freeze({listen:function(t,c){return[...[].concat(t)].forEach(t=>{n[t]=(n[t]||[]).concat(c)}),this},emit:function(t,c){return!!n[t]&&[...n[t]].forEach(n=>n(c))},all:function(){return n}})}

 /**
  * Init global gift with purchase event bus.
  */
 window.gwp = window.gwp || {}; 
 window.gwp.EventBus = eventBusGwp();
 