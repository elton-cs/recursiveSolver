import { proofOfCodeZKP } from './proofOfCodeZKP.js';
import { viewableInputHash } from './viewableInputHash.js';
import { Field, Poseidon } from 'snarkyjs';

// compiling
console.time('compiling');
const { verificationKey } = await proofOfCodeZKP.compile();
console.timeEnd('compiling');

// 1. Bounty Builder commits:
// unit test code [private input]
// its poseidon hash [public input]

// public inputs
let hashOfTest = Poseidon.hash([Field(1204)]);
let noSolution = Field(0);

let newBountyState = new viewableInputHash({
  testHash: hashOfTest,
  solutionASMHash: noSolution,
});

// private inputs
let test = Field(1204);

// commiting unit test code and it's hash [proof 1]
console.time('commiting hash of unit test');
const proof0 = await proofOfCodeZKP.init(newBountyState, test);
console.timeEnd('commiting hash of unit test');
// --------------------------------------------------------------------------

// 2. Builder sends proof of unit test commitment to Hunter

// proof from available bounty
let openBounty = proof0.publicInput.testHash;

// private input
let solutionInCode = 777;
let solutionInASM = Field(solutionInCode);

// public inputs
let solutionASMHash = Poseidon.hash([solutionInASM]);

let inProgressBountyState = new viewableInputHash({
  testHash: openBounty,
  solutionASMHash: solutionASMHash,
});

// commiting ASM of unit test solution [proof 2]
console.time('commiting ASM of unit test solution');
const proof1 = await proofOfCodeZKP.commitASM(
  inProgressBountyState,
  proof0,
  solutionInASM
);
console.timeEnd('commiting ASM of unit test solution');
