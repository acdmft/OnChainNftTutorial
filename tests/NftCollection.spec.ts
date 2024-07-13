import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';
import { buildCollectionContentCell, setItemContentCell } from '../scripts/nftContent/onChain';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('NftCollection', () => {
    let code: Cell;
    let item: Cell;

    beforeAll(async () => {
        code = await compile('NftCollection');
        item = await compile('NftItem');
    });

    let blockchain: Blockchain;
    let nftCollection: SandboxContract<NftCollection>;
    let collectionOwner: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        collectionOwner = await blockchain.treasury("ownerWallet");

        nftCollection = blockchain.openContract(NftCollection.createFromConfig({
            ownerAddress: collectionOwner.address,
            nextItemIndex: 0,
            collectionContent: buildCollectionContentCell({
                name: "OnChain collection",
                description: "Collection of items with onChain metadata",
                image: "https://raw.githubusercontent.com/Cosmodude/Nexton/main/Nexton_Logo.jpg"
            }),
            nftItemCode: item,
            royaltyParams:  {
                royaltyFactor: Math.floor(Math.random() * 500), 
                royaltyBase: 1000,
                royaltyAddress: collectionOwner.getSender().address as Address
            }
        }, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nftCollection are ready to use
    });
});
