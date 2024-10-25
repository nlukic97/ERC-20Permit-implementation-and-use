import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { AddressLike } from "ethers";
import { NetworkConfig } from "hardhat/types";

const ONE_ETHER = ethers.parseEther('1')

async function signPermit({
  owner,
  spender,
  value,
  nonce,
  deadline,
  tokenName,
  tokenAddress,
  signer,
  chainId
}:{
  owner:AddressLike,
  spender:AddressLike,
  value:bigint,
  nonce: bigint,
  deadline:number,
  tokenName:String,
  tokenAddress:AddressLike,
  signer:any, // TODO - check for this
  chainId: number
}) {
  // Define the EIP-712 domain
  const domain = {
      name: tokenName,
      version: "1",
      chainId: chainId,
      verifyingContract: tokenAddress,
  };
  
  // Define the Permit struct type
  const types = {
    // https://eips.ethereum.org/EIPS/eip-2612 
    // TODO - look at the message being constructed in ee.json (from link above, its similar)
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  

  // Define the Permit struct message
  const message = {
      owner,
      spender,
      value,
      nonce,
      deadline,
  };

  // Sign the message
  const signature = await signer.signTypedData(domain, types, message);
  
  // Split the signature into r, s, v components
  const { r, s, v } = ethers.Signature.from(signature);
  
  return { v, r, s };
}

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  
  async function deployTokenContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, secondUser] = await hre.ethers.getSigners();

    const peritCoin = await hre.ethers.getContractFactory('PERMITCOIN');
    const TokenContract = await peritCoin.deploy(owner.address);

    return { TokenContract, owner, secondUser };
  }

  describe("Token",function(){
    
    it('Should show owner has initialy minted balance of 1Eth in tokens', async function(){
      const { TokenContract, owner} = await loadFixture(deployTokenContract);
      expect(await TokenContract.balanceOf(owner)).to.equal(ONE_ETHER)
    })
    
    it('Should show secondUser has balance of 0 tokens', async function(){
      const { TokenContract, secondUser} = await loadFixture(deployTokenContract);
      expect(await TokenContract.balanceOf(secondUser)).to.equal(0)
    })
    
    it('Should permit secondUser to transfer funds from first user to secondUser', async function(){
      const { TokenContract, owner, secondUser} = await loadFixture(deployTokenContract);

      const nonce = await TokenContract.nonces(owner)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

      const chainId = hre.network.config.chainId
      if(!chainId){
        console.error("NO CHAIN ID")
        return

      }
      const { v, r, s } = await signPermit({
          owner: owner.address,
          spender:secondUser.address,
          value: ONE_ETHER,
          nonce,
          deadline,
          tokenName: await TokenContract.name(),
          tokenAddress: await TokenContract.getAddress(),
          signer: owner,
          chainId: chainId
      });

      expect(await TokenContract.allowance(owner.address, secondUser.address)).to.equal(0)

      await TokenContract.connect(secondUser).permit(owner.address, secondUser.address, ONE_ETHER, deadline, v, r, s)
      expect(await TokenContract.allowance(owner.address, secondUser.address)).to.equal(ONE_ETHER)
      
      await TokenContract.connect(secondUser).transferFrom(owner.address, secondUser.address, ONE_ETHER)
      expect(await TokenContract.balanceOf(secondUser.address)).to.equal(ONE_ETHER)
      expect(await TokenContract.balanceOf(owner.address)).to.equal(0)
    
    })
  })
});