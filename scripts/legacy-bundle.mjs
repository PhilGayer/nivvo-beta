import {build} from 'esbuild';
await build({entryPoints:['engine/motor.mjs'],outfile:'engine/motor-legacy.js',bundle:true,format:'iife',globalName:'NivvoMotor',target:'es2022',legalComments:'none'});
