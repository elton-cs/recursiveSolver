import {
  Bool,
  Experimental,
  Field,
  Poseidon,
  PrivateKey,
  PublicKey,
  SelfProof,
} from 'snarkyjs';
import { publicBountyState } from './publicBountyState.js';

export const proofOfCodeHEX = Experimental.ZkProgram({
  // PUBLIC INPUT: hash of unit test with empty (boilerplate) solution
  publicInput: publicBountyState,

  methods: {
    // Builder function that commits an open bounty unit test
    commitTest: {
      privateInputs: [],
      method(testOnlyState: publicBountyState) {
        // here a poseidon hash is applied to the code string
        // to assert that the builder is not falsifying their test
        testOnlyState.solutionASMHash.assertEquals(Field(0));
      },
    },

    // Hunter function that commits a solution proposal to an open bounty
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

    // Builder function that creates a recursive proof accepting a hunter's solution proposal
    // aka the builder will accept a working solution from this hunter.
    confirmSolutionProposal: {
      privateInputs: [SelfProof, Bool],

      method(
        confirmSolutionProposalState: publicBountyState,
        testWithASMStateProof: SelfProof<publicBountyState, Field>,
        isAccepted: Bool
      ) {
        testWithASMStateProof.verify();
        confirmSolutionProposalState.testHash.assertEquals(
          testWithASMStateProof.publicInput.testHash
        );
        confirmSolutionProposalState.solutionASMHash.assertEquals(
          testWithASMStateProof.publicInput.solutionASMHash
        );
        isAccepted.assertEquals(Bool(true));
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
