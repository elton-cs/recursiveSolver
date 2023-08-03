import { hexOfSolution } from './hexOfSolution.js';
import { hexOfTest } from './hexOfTest.js';
import { encodeHexToField } from './hexToField.js';
import { proofOfCodeHEX } from './proofOfCodeHEX.js';
import { publicBountyState } from './publicBountyState.js';
import { Bool, Field } from 'snarkyjs';

// compiling
console.time('compiling');
const { verificationKey } = await proofOfCodeHEX.compile();
console.timeEnd('compiling');
// --------------------------------------------------------------------------

// 1. Builder commits unit test hash to open a bounty

// public inputs
let hashOfTest = encodeHexToField(hexOfTest);
let noSolution = Field(0);

let newBountyState = new publicBountyState({
  testHash: hashOfTest,
  solutionASMHash: noSolution,
});

// commiting unit test code hash [proof 1]
console.time('commiting hash of unit test');
const proof0 = await proofOfCodeHEX.commitTest(newBountyState);
console.timeEnd('commiting hash of unit test');
// --------------------------------------------------------------------------

// 2. Hunter commits solution proposal of ASM solution

// proof from available bounty
let openBounty = proof0.publicInput.testHash;

// private input
// let solutionInCode = 777;
// let solutionInASM = Field(solutionInCode);

let solutionInASM = hexOfSolution;
let solutionASMHash = encodeHexToField(solutionInASM);

// public inputs

let inProgressBountyState = new publicBountyState({
  testHash: openBounty,
  solutionASMHash: solutionASMHash,
});

// commiting ASM hash of unit test solution [proof 2]
console.time('commiting ASM of unit test solution');
const proof1 = await proofOfCodeHEX.commitASM(inProgressBountyState, proof0);
console.timeEnd('commiting ASM of unit test solution');
// --------------------------------------------------------------------------

// 3. Builder accepts a Hunter's solution proposal

const proposalToAcceptProof = proof1;

let proposalBountyState = new publicBountyState({
  testHash: proof1.publicInput.testHash,
  solutionASMHash: proof1.publicInput.solutionASMHash,
});

console.time('accepting proposal of solution');
const proof2 = await proofOfCodeHEX.confirmSolutionProposal(
  proposalBountyState,
  proof1,
  Bool(true)
);
console.timeEnd('accepting proposal of solution');
// --------------------------------------------------------------------------
