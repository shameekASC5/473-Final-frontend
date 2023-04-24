import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {utils } from 'web3';
import getBlockchain from './ethereum.js';
import {Pie} from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';

// adapted from: https://github.com/jklepatch/eattheblocks/blob/master/screencast/244-prediction-market-us-elections/frontend/src/App.js

const TEAM = {
    A: 0,
    NOT_A: 1
};

var signer;
function App() {
    const [predictionMarket, setPredictionMarket] = useState(undefined);
    const [myBets, setMyBets] = useState(undefined);
    const [betPredictions, setMyBetPredictions] = useState(undefined);
    const [betPlaced, setBetPlaced] = useState(undefined);

    useEffect( () => {
        const init = async () => {
            const { signerAddress, predictionMarket} = await getBlockchain();
            const bets = await Promise.all([
                predictionMarket.bets(TEAM.A),
                predictionMarket.bets(TEAM.NOT_A),
            ]
            );
            signer = signerAddress;
            const betPredictions = {
                labels: [
                    'A',
                    'NOT_A',
                ],
                datasets: [{
                    data: [
                        ethers.utils.formatEther(bets[0]).toString(), ethers.utils.formatEther(bets[1]).toString()
                    ],
                    backgroundColor: [
                        '#36A2EB',
                        '#FF6384',
                    ],
                    hoverBackgroundColor: [
                        '#36A2EB',
                        '#FF6384',
                    ]
                }]
            };

            const myBets = await Promise.all([
                predictionMarket.betsPerGambler(signerAddress, TEAM.A),
                predictionMarket.betsPerGambler(signerAddress, TEAM.NOT_A)
            ]);

            setMyBetPredictions(betPredictions);
            setPredictionMarket(predictionMarket);
            setMyBets(myBets);
        };
        init();
    }, []);

    if(
        typeof predictionMarket == 'undefined' || typeof myBets == 'undefined' || typeof betPredictions == 'undefined'
    ) { return 'Loading...'; }

    const placeBet = async(team, e) => {
        try {
            e.preventDefault(); // prevent form submit
            await predictionMarket.placeBet(
                team,
                {value: utils.toWei(e.target.elements[0].value.toString(), 'ether')}
            )
        }
        catch (error) {
            console.log(error)
            toast.error(error.toString().substring(0,100))
        }
    }

    // useEffect( () => {
        
    // }, [placeBet])

    const withdrawGain = async() => {
        try {
            await predictionMarket.withdrawGain(signer);
        }
        catch (error) {
            console.log(error)
            toast.error(error.toString().substring(0,100))
        }
    }

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-sm-12'>
                <h1 className='text-center'>Prediction Market</h1>
                <div className="jumbotron">
                    <h1 className="display-4 text-center">Will Rohan and Shameek receive an A on their final project?</h1>
                    <p className="lead text-center">Current odds</p>
                    <div>
                        <Pie data={betPredictions}/>
                    </div>
                </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-sm-6'>
                <div className="card">
                    {/* <img src='./img/trump.png' /> */}
                    <div className="card-body">
                    <h5 className="card-title">Of course they will!</h5>
                    <form className="form-inline" onSubmit={e => placeBet(TEAM.A, e)}>
                        <Toaster />
                        <input
                        type="text"
                        className="form-control mb-2 mr-sm-2"
                        placeholder="Bet amount (ether)"
                        />
                        <button
                        type="submit"
                        className="btn btn-primary mb-2"
                        >
                        Submit
                        </button>
                    </form>
                    </div>
                </div>
                </div>

                <div className='col-sm-6'>
                <div className="card">
                    {/* <img src='./img/biden.png' /> */}
                    <div className="card-body">
                    <h5 className="card-title">I don't think so...</h5>
                    <form className="form-inline" onSubmit={e => placeBet(TEAM.NOT_A, e)}>
                        <Toaster />
                        <input
                        type="text"
                        className="form-control mb-2 mr-sm-2"
                        placeholder="Bet amount (ether)"
                        />
                        <button
                        type="submit"
                        className="btn btn-primary mb-2"
                        >
                        Submit
                        </button>
                    </form>
                    </div>
                </div>
                </div>
            </div>

            <div className='row'>
                <h2>Your bets</h2>
                <ul>
                    <li>Team <em>A:</em> {ethers.utils.formatEther(myBets[0]).toString()} ETH</li>
                    <li>Team <em>NOT_A:</em> {ethers.utils.formatEther(myBets[1]).toString()} ETH</li>
                </ul>
            </div>

            <div className='row'>
            <h2>Claim your gains, if any, after the election</h2>
            <button
                type="submit"
                className="btn btn-primary mb-2"
                onClick={e => withdrawGain()}
            >
                Submit
            </button>
            <Toaster />
            </div>
        </div>
    );
}

export default App;
