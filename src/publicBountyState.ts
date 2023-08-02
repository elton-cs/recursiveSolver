import { Field, Struct } from 'snarkyjs';

export class publicBountyState extends Struct({
  testHash: Field,
  solutionASMHash: Field,
}) {}
