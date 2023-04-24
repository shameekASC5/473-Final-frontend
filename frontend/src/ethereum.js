import { ethers, Contract } from 'ethers';
import PredictionMarket from './contracts/PredictionMarket.json';

const getBlockchain = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if(window.ethereum) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const predictionMarket = new Contract(
          "0xbC8980963cA47A0157d1518d7083754De69E7862",
          PredictionMarket.abi,
          signer
        );

        resolve({signerAddress, predictionMarket});
      }
      resolve({signerAddress: undefined, predictionMarket: undefined});
    });
  });

export default getBlockchain;
