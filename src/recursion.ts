import { Experimental, Field, Poseidon, SelfProof } from 'snarkyjs';

const ProofOfCode = Experimental.ZkProgram({
  // PUBLIC INPUT: hash of unit test with empty (boilerplate) solution
  publicInput: Field,

  methods: {
    // this function will commit that the raw unit test code used for
    // testing matches the public input test hash supplied.
    init: {
      privateInputs: [Field],
      method(testHash: Field, testCode: Field) {
        // here a poseidon hash is applied to the code string
        // to assert that the builder is not falsifying their test
        testHash.assertEquals(Poseidon.hash([testCode]));
      },
    },

    commitASM: {
      privateInputs: [SelfProof, Field],
      method(
        testHashWithASM: Field,
        testInitProof: SelfProof<Field, Field>,
        solutionASM: Field
      ) {
        testInitProof.verify();
        testHashWithASM.assertEquals(
          Poseidon.hash([testInitProof.publicInput, solutionASM])
        );
      },
    },

    add: {
      privateInputs: [SelfProof, SelfProof],

      method(
        newState: Field,
        earlierProof1: SelfProof<Field, Field>,
        earlierProof2: SelfProof<Field, Field>
      ) {
        earlierProof1.verify();
        earlierProof2.verify();
        newState.assertEquals(
          earlierProof1.publicInput.add(earlierProof2.publicInput)
        );
      },
    },
  },
});

// compiling
console.time('compiling');
const { verificationKey } = await ProofOfCode.compile();
console.timeEnd('compiling');

// 1. Bounty Builder commits:
// unit test code [private input]
// its poseidon hash [public input]
let hashOfTest = Poseidon.hash([Field(1204)]);
let test = Field(1204);

// commiting unit test code and it's hash [proof 1]
console.time('commiting hash of unit test');
const proof0 = await ProofOfCode.init(hashOfTest, test);
console.timeEnd('commiting hash of unit test');
// --------------------------------------------------------------------------

// 2. Builder sends proof of unit test commitment to Hunter

let openBounty = hashOfTest;

let solutionInCode = 777;
let solutionInASM = Field(solutionInCode);
let hashOfTestWithASM = Poseidon.hash([openBounty, solutionInASM]);

// commiting ASM of unit test solution [proof 2]
console.time('commiting ASM of unit test solution');
const proof1 = await ProofOfCode.commitASM(
  hashOfTestWithASM,
  proof0,
  solutionInASM
);
console.timeEnd('commiting ASM of unit test solution');
