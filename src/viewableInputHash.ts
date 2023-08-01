import { Experimental, Field, Poseidon, SelfProof, Struct } from 'snarkyjs';

export class viewableInputHash extends Struct({
  testHash: Field,
  solutionASM: Field,
}) {}
