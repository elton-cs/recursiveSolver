import { Field, Poseidon } from 'snarkyjs';
import { hexArray } from './output_hex.js';

// let basicTest = Field('383032383832663064343137316165393237633933643663333262326565')
// console.log(basicTest)
// console.log(Poseidon.hash([basicTest]))

let compressedHash = Field(0);
let count = 0;
for (let hex of hexArray) {
  let hexInInt = parseInt(hex, 16);
  compressedHash = Poseidon.hash([compressedHash, Field(hexInInt)]);

  count++;
  console.log('hex #' + count + ':' + hex);
  console.log('hashed #' + count + ':' + compressedHash);
}

export const finalizedHash = compressedHash;

// console.log(finalizedHash);
