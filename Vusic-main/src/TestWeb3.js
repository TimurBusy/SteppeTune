import React, { useEffect, useState } from "react";
import { getWeb3, getContract } from "./blockchain";

function TestWeb3() {
    const [account, setAccount] = useState("");
    const [numSongs, setNumSongs] = useState(0);

    useEffect(() => {
        const loadBlockchainData = async () => {
            const web3 = await getWeb3();
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const contract = await getContract();
                if (contract) {
                    const songCount = await contract.methods.getNumSongs().call();
                    setNumSongs(songCount);
                }
            }
        };
        loadBlockchainData();
    }, []);

    return (
        <div>
            <h2>Ваш Ethereum-аккаунт: {account}</h2>
            <h3>Количество треков в блокчейне: {numSongs}</h3>
        </div>
    );
}

export default TestWeb3;
