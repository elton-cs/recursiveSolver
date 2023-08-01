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

    addNumber: {
      privateInputs: [SelfProof, Field],

      method(
        newState: Field,
        earlierProof: SelfProof<Field, Field>,
        numberToAdd: Field
      ) {
        earlierProof.verify();
        newState.assertEquals(earlierProof.publicInput.add(numberToAdd));
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

let hashOfTest = Poseidon.hash([Field(1204)]);
let test = Field(1204);

console.time('compiling');
const { verificationKey } = await ProofOfCode.compile();
console.timeEnd('compiling');

console.time('commiting hash of unit test');
const proof0 = await ProofOfCode.init(hashOfTest, test);
console.timeEnd('commiting hash of unit test');
