import { Experimental, Field, Poseidon, SelfProof } from 'snarkyjs';
import { publicBountyState } from './publicBountyState.js';

export const proofOfCodeHEX = Experimental.ZkProgram({
  // PUBLIC INPUT: hash of unit test with empty (boilerplate) solution
  publicInput: publicBountyState,

  methods: {
    // this function will commit that the raw unit test code used for
    // testing matches the public input test hash supplied.
    init: {
      privateInputs: [],
      method(testOnlyState: publicBountyState) {
        // here a poseidon hash is applied to the code string
        // to assert that the builder is not falsifying their test
        testOnlyState.solutionASMHash.assertEquals(Field(0));
      },
    },

    commitASM: {
      privateInputs: [SelfProof],
      method(
        testWithASMState: publicBountyState,
        testOnlyStateProof: SelfProof<publicBountyState, Field>
      ) {
        testOnlyStateProof.verify();
        testWithASMState.testHash.assertEquals(
          testOnlyStateProof.publicInput.testHash
        );
        testWithASMState.solutionASMHash.assertNotEquals(
          testOnlyStateProof.publicInput.solutionASMHash
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
