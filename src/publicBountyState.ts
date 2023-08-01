import { Experimental, Field, Poseidon, SelfProof, Struct } from 'snarkyjs';

export class publicBountyState extends Struct({
  testHash: Field,
  solutionASMHash: Field,
}) {}
