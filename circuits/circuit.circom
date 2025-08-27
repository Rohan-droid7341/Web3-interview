pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";


template ProveDID() {
    signal input secret;

    
    signal output commitment;

    component hasher = Poseidon(1);

    hasher.inputs[0] <== secret;

    commitment <== hasher.out;
}

component main = ProveDID();