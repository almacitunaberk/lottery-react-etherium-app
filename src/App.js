import web3 from './web3';
import lottery from './lottery';
import { useEffect, useState } from 'react';

const App = () => {
  const [managerAddress, setManagerAddress] = useState('');
  const [players, setPlayers] = useState([]);
  const [reward, setReward] = useState('');
  const [bitValue, setBitValue] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [waitingMessage, setWaitingMessage] = useState(null);
  const [pickWinnerMessage, setPickWinnerMessage] = useState(null);

  useEffect(() => {
    async function fetchManagerAddress() {
      const manager = await lottery.methods.manager().call();
      const _accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _players = await lottery.methods.getPlayers().call();
      const money = await web3.eth.getBalance(lottery.options.address);
      setManagerAddress(manager);
      setPlayers(_players);
      setReward(web3.utils.fromWei(money, 'ether'));
      setAccounts(_accounts);
      console.log('Accounts: ', _accounts);
    }
    fetchManagerAddress();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    setWaitingMessage('Please wait while entering to the lottery');
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei(`${bitValue}`, 'ether') });
    setPlayers([...players, accounts[1]]);
    setWaitingMessage('You have entered to the lottery');
    setTimeout(() => {
      setWaitingMessage(null);
    }, 3000);
  };

  const handlePickWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    setPickWinnerMessage('Picking a winner...');
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    setPickWinnerMessage('A winner is picked.');
    setTimeout(() => {
      setPickWinnerMessage(null);
    }, 3000);
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>This lottery is managed by {managerAddress}</p>
      {players.length === 0 ? (
        <div>
          <p> There are no players in the game.</p>
        </div>
      ) : (
        <div>
          <p>
            {' '}
            There are {players.length} players in the game competing for {reward} etherium.
          </p>
          {players.forEach((player) => (
            <p>{player}</p>
          ))}
        </div>
      )}

      <hr />
      <form onSubmit={handleSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to bet</label>
          <input
            value={bitValue}
            onChange={(e) => {
              setBitValue(e.target.value);
            }}
          />
          <button type="submit">Enter</button>
        </div>
      </form>
      {waitingMessage && <p>{waitingMessage}</p>}
      <hr />
      <h4>Ready to pick a winner?</h4>
      <button onClick={handlePickWinner}></button>
      <hr />
    </div>
  );
};
export default App;
