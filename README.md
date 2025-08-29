# Overwhelm - Trading PlayGround 

Overwhelm is a decentralized trading dApp designed to help beginners step into the world of trading without the risks of losing real money. Using dummy tokens, users can learn the ins and outs of trading while still experiencing real-time market dynamics. With live price feeds for Ethereum (ETH) and USD tokens, users can practice trading just like in real markets. A built-in faucet lets them wrap their Sepolia ETH into WETH, forming the foundation for all trades inside the app.

This immersive and risk-free environment provides an ideal training ground for aspiring traders to hone their skills and build confidence before venturing into live markets.


![alt text](image.png)  


## Table of Contents

- [Core Features](#core-features)  
- [Tech Stack](#tech-stack)  
- [UI Components](#ui-components)
- [How It Works](#how-it-works)
- [Rating Tech Stack](#rating-tech-stack)  
- [Future Plans](#future-plans)  

## Core Features

- *Risk-Free Trading*  
Experiment with trading strategies using dummy tokens without any real financial consequences.
- *Real-Time Market Data*  
Experience authentic market conditions with live price feeds for ETH and USD tokens
- *Seamless Onboarding*  
Get started quickly and easily with embedded wallet creation.
- *Practice with WETH*  
A built-in faucet allows you to wrap Sepolia ETH into WETH to use in the trading playground.
- *Enhanced Privacy*  
An extra layer of privacy and authentication is provided through the use of Zero-Knowledge Proofs.

## Tech Stack

- *Frontend:* Next.js (App Router), Tailwind , Typescript  
- *Wallet* Privy  
- *Blockchain Integration:* wagmi, viem  
- *Second Layer Auth:* Zero-Knowledge Proof
- *Event quering and fetching (indexing):* Graph Protocol
- *Live Price:* Chanlink Smart Feed 
- *ERC20:* Solidity Contract

## UI Components

### 1. Landing Page  

A clean welcome screen prompting users to connect their wallet and start exploring.

<img width="1878" height="851" alt="image" src="https://github.com/user-attachments/assets/271b2b79-e209-4e73-a868-2952fc15b3cc" />


### 2. Zkp Auth  

Second level of security to Overwhelm

<img width="1855" height="612" alt="image" src="https://github.com/user-attachments/assets/bffc7df2-dfdb-4c57-9b81-cc0332d70c97" />


### 3. Trading Interface  

Dashboard to monitor all of your trades .

<img width="1784" height="849" alt="image" src="https://github.com/user-attachments/assets/20f855a4-bbf6-47f9-a707-955cd1fa8a03" />


### 4. Transaction Explorer 

Logs all of the transaction here

<img width="1829" height="830" alt="image" src="https://github.com/user-attachments/assets/7c7e0660-f537-4149-973c-0f13acd3753a" />

### 5. WETH faucet   

Faucet to get Wrapped ETH

<img width="1652" height="713" alt="image" src="https://github.com/user-attachments/assets/5f62d1c4-91e8-40b7-8c05-777484578070" />


## How It Works

<img width="1090" height="799" alt="Screenshot 2025-08-30 003250" src="https://github.com/user-attachments/assets/0959cecc-bf42-4a1d-bdbf-74362659e705" />

## Rating Tech Stack

| Tech Stack             | Difficulty | Usefulness | Personal Notes |
|-------------------------|------------|------------|----------------|
| Privy (Wallets)        | Easy-Medium     |  High       | Great for user who dont have wallets. Rainbow kit is still easier |
| Zero Knowledge Proofs   | Hard       |  High       | Great for dapps that need to be secure |
| Wagmi (Smart Contracts) | Medium       |  High       | Best frontend integration tool  |
| GraphQL (Indexing)      | Medium     | Very HIgh     | Saves many lines of code in contract and best for making contract short |
| Chainlink Price Feeds   | Medium       |  High       | Reliable for live data , critical for trading logic |
| ERC20 / Trading Contract| Medium-Hard     | High       | Great fo creating dummy Tokens |

##  Future Plans  

The next phase of **Overwhelm** focuses on pushing the boundaries of decentralized trading by integrating advanced tools and protocols:  

- **Chainlink Automation** → Enable automated trade execution so users can set conditions (like stop-loss or take-profit) and let the system handle trades without manual intervention.  
- **ElizaOS Bots** → Deploy customizable autonomous trading bots that can analyze data, make decisions, and execute trades on behalf of users, giving a taste of algorithmic trading.  
- **Chainlink CCIP (Cross-Chain Interoperability Protocol)** → Expand trading capabilities beyond Sepolia/WETH to multiple blockchains and token standards, enabling a true cross-chain trading experience.  


