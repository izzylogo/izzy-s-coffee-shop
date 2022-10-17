// import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'
import moment from 'moment/moment';
import {motion, variants} from 'framer-motion'

const textAnimate={
  offscreen:{y: -1000, opacity: 0},
  onscreen:{y: 0, 
    // display: 'block',
    opacity: [0.2, 0.5, 0.7, 0.9, 1 ],
    transition: {type: 'spring',
    bounce: 0.4,
    delay: 0.3,
    duration: 2}
  }
}

const spanAni={
  offscreen:{y: -10, opacity: 0},
  onscreen:{y: 0,
    opacity: [0.2, 1],
    transition: {type: 'spring',
    bounce: 1,
    delay: 0.1,
    duration: 1}
  }
}

const pAni={
  offscreen:{y: -100, opacity: 0},
  onscreen:{y: 0,
    opacity: [0, 0.2, 0.5, 0.8, 1],
    transition: {type: 'spring',
    bounce: 0.2,
    delay: 0.4,
    duration: 0.8}
  }
}

const p2Ani={
  offscreen:{y: -100, opacity: 0},
  onscreen:{y: 0,
    opacity: [0, 0.2, 0.5, 0.8, 1],
    transition: {type: 'spring',
    bounce: 0.2,
    delay: 0.5,
    duration: 0.8}
  }
}

const p3Ani={
  offscreen:{y: -100, opacity: 0},
  onscreen:{y: 0,
    opacity: [0, 0.2, 0.5, 0.8, 1],
    transition: {type: 'spring',
    bounce: 0.2,
    delay: 0.6,
    duration: 0.8}
  }
}



export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x8175Ac8cb64742A48893784A7C089250Fe9cfA7C";
  // const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [amount, setAmount] = useState("")

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  const onAmountChange = (e) => {
    setAmount(e.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Someone",
          message ? message : `This is from ${name}`,
          {
            value: ethers.utils.parseEther(amount)
          }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // withdrawing tips
        getTips();

        // Clear the form fields.
        setName(" ");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // withdrawing tips
  const getTips = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("Getting tips...");
        const memos = await buyMeACoffee.withdrawTips();
        console.log("Sent tips");
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
        

      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    window.alert("The tokens should be sent in Goeril.")

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);


  // const time = moment.unix(1665802908)
  // const show = time.toString();
  // console.log(show)
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Izzy Coffe Shop</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@200;300;400;500&display=swap" rel="stylesheet"/>
      </Head>

      <motion.div 
        className="flex items-baseline justify-between gap-6 lg:block lg:items-center lg:justify-center "
        initial={'offscreen'}
        whileInView={'onscreen'}
        viewport={{once:true, amount:0.3}}
        transition={{staggerChildren:0.8}}
      >

        <main className='main flex-1 lg:w-full'>
          <motion.h1 
            className='text-purple-600 text-center md:text-5xl font-semibold text-6xl mb-20'
            variants={textAnimate}
            
          >
            Izzy's Coffee Shop..
          </motion.h1>
          
          {currentAccount ? (
            <div className='w-full flex justify-center items-center'>
              <motion.form 
                className='w-full  flex justify-center items-center flex-col'
                initial={'offscreen'}
                whileInView={'onscreen'}
                viewport={{once:true, amount:0.3}}
                transition={{staggerChildren:0.8}}
              >
                <motion.div className='w-3/6 lg:w-full' variants={pAni}>
                  <label>
                    Name
                  </label>
                  <br/>
                  
                  <input
                    className='w-full input-box'
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    onChange={onNameChange}
                    required
                  />
                </motion.div>
                <br/>
                <motion.div className='w-3/6 lg:w-full' variants={p2Ani}>
                  <label htmlFor="amount">
                    Amount
                  </label>
                  <br />
                  <input 
                    className='w-full input-box'
                    type="number"
                    placeholder='amount' 
                    onChange={onAmountChange}
                    id="amount"  
                    value={amount}
                    required
                  />
                </motion.div>
                <br/>
                <br />
                <motion.div className='w-3/6 lg:w-full' variants={p3Ani}>
                  <label>
                    Send Israel a message
                  </label>
                  <br/>

                  <textarea
                    className='w-full input-box'
                    rows={3}
                    placeholder='Type in your message.'
                    id="message"
                    onChange={onMessageChange}
                    required
                  >
                  </textarea>
                </motion.div>
                <motion.div className='w-2/4' variants={pAni}>
                  <button
                    type="button"
                    onClick={buyCoffee}
                    className='outline-none w-full mt-10 border-purple-800 rounded-xl border-2 p-2 px-6 connect buy'
                  >
                    Buy Coffee
                  </button>
                </motion.div>
              </motion.form>
            </div>
          ) : (
            <motion.button 
              onClick={connectWallet} 
              className='outline-none hover:scale-110 hover:bg-blue-400 border-purple-800 rounded-xl border-2 p-2 px-6 connect'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{type: 'spring',
              bounce: 0.2,
              delay: 1.2,
              duration: 1}}
            > 
              Connect your wallet 
            </motion.button>
          )}
        </main>

{/* Showing the list of coffees given */}
        
        <motion.div 
          className="flex flex-col mt-28 mb-5 flex-2"
          initial={'offscreen'}
          whileInView={'onscreen'}
          viewport={{once:true, amount:0.3}}
          transition={{staggerChildren:0.8}}
        >
          {currentAccount && (<h1 className='text-4xl underline decoration-solid text-purple-600 mb-10'>Coffees received</h1>)}
          {currentAccount && (memos.map((memo, idx) => {
            return (
              <motion.div 
              key={idx} 
              // style={{border:"2px solid", "borderRadius":"5px", padding: "5px", margin: "5px"}}
              className='border-2 py-3 px-10 m-2 border-slate-700 rounded-2xl card'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{type: 'spring',
              bounce: 0.2,
              delay: 1.2,
              duration: 1}}
              >
                <p className='text-xl' style={{"fontWeight":"bold"}}>"{memo.message}"</p>
                <p className='text-lg'>From: {memo.name},  </p>
                <p className='text-sm'>Time: {moment.unix(memo.timestamp).toString()}</p>
                <p className='text-purple-500 font-normal text-sm'>Address: {memo.from}</p>
              </motion.div>
            )
          }))}
        </motion.div>
      </motion.div>


      <footer className='flex flex-1 pt-8 pb-6 justify-center items-center border-purple-700 border-t-2'>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by IzzyDev
        </a>
      </footer>
    </div>
  )
}