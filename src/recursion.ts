import { Experimental, Field, Poseidon, SelfProof } from 'snarkyjs';
import { viewableInputHash } from './viewableInputHash.js';

const ProofOfCode = Experimental.ZkProgram({
  // PUBLIC INPUT: hash of unit test with empty (boilerplate) solution
  publicInput: viewableInputHash,

  methods: {
    // this function will commit that the raw unit test code used for
    // testing matches the public input test hash supplied.
    init: {
      privateInputs: [Field],
      method(testOnlyState: viewableInputHash, testCode: Field) {
        // here a poseidon hash is applied to the code string
        // to assert that the builder is not falsifying their test
        testOnlyState.testHash.assertEquals(Poseidon.hash([testCode]));
        testOnlyState.solutionASMHash.assertEquals(Field(0));
      },
    },

    commitASM: {
      privateInputs: [SelfProof, Field],
      method(
        testWithASMState: viewableInputHash,
        testOnlyStateProof: SelfProof<viewableInputHash, Field>,
        solutionASM: Field
      ) {
        testOnlyStateProof.verify();
        testWithASMState.testHash.assertEquals(
          testOnlyStateProof.publicInput.testHash
        );
        testWithASMState.solutionASMHash.assertEquals(
          Poseidon.hash([solutionASM])
        );
      },
    },

    // add: {
    //     privateInputs: [SelfProof, SelfProof],

    //     method(
    //         newState: Field,
    //         earlierProof1: SelfProof<Field, Field>,
    //         earlierProof2: SelfProof<Field, Field>
    //     ) {
    //         earlierProof1.verify();
    //         earlierProof2.verify();
    //         newState.assertEquals(
    //             earlierProof1.publicInput.add(earlierProof2.publicInput)
    //         );
    //     },
    // },
  },
});

// compiling
console.time('compiling');
const { verificationKey } = await ProofOfCode.compile();
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
const proof0 = await ProofOfCode.init(newBountyState, test);
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
const proof1 = await ProofOfCode.commitASM(
  inProgressBountyState,
  proof0,
  solutionInASM
);
console.timeEnd('commiting ASM of unit test solution');
