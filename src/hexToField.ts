import { Field, Poseidon } from 'snarkyjs';

export function encodeHexToField(codeArray: string[]): Field {
  let compressedHash = Field(0);
  for (let hex of codeArray) {
    let hexInInt = parseInt(hex, 16);
    compressedHash = Poseidon.hash([compressedHash, Field(hexInInt)]);
  }
  return compressedHash;
}
