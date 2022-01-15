import React, { Component } from 'react';

import GizaToken from './abis/GizaToken.json'
import Khufu from './abis/Khufu.json'
import Web3 from 'web3';
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Stack from 'react-bootstrap/Stack'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'

import './App.css';

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      window.ethereum.on('accountsChanged', function () {
          window.location.reload();
      })
      await this.connect();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadData() {
    const web3 = window.web3
    const netId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]

    this.setState({ account, web3 })

    const tokenData = GizaToken.networks[netId];
    if (tokenData) {
      const token = new web3.eth.Contract(GizaToken.abi, tokenData.address);
      this.setState({ token })

      const tokenBalance = await token.methods.balanceOf(account).call()
      this.setState({ tokenBalance: (tokenBalance ? tokenBalance : 0) })
    }

    const khufuData = Khufu.networks[netId];
    if (khufuData) {
      const khufu = new web3.eth.Contract(Khufu.abi, khufuData.address)
      this.setState({ khufu })

      const totalBalance = await khufu.methods.totalBalance().call()
      this.setState({ totalBalance })

      const accountBalance = await khufu.methods.balanceOf(account).call()
      this.setState({ accountBalance })

      const isParticipating = await khufu.methods.isParticipating(account).call()
      this.setState({ isParticipating })

    } else {
      window.alert('Contract not deployed to the current network')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      tokenBalance: null,
      khufu: null,
      totalBalance: null,
      accountBalance: null,
      isParticipating: false
    }
  }

  async join(referral) {
    await this.state.khufu.methods.join(referral).send({ from: this.state.account, value: this.state.web3.utils.toWei('0.01', 'ether') })
    window.location.reload();
  }

  async leave(e) {
    e.preventDefault()
    await this.state.khufu.methods.leave().send({ from: this.state.account })
    window.location.reload();
  }

  async connect(e) {
    //e.preventDefault()
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //setAccounts(accounts);
    this.setState({ account: accounts[0] }) 
  }

  render() {
    let content
    if (this.state.isParticipating) {
      content = <div className='text-center'><br></br><Button variant="danger" type="submit" onClick={(e) => this.leave(e)}>LEAVE SCHEME</Button><br></br></div>
    } else {
      content = 
      <div>
        <Alert variant="info" className='text-center'>
          <Alert.Heading>Referral address</Alert.Heading>
          <p>This is the top of the pyramid address.<br></br>
          0xDa14131E0239a98bB08c8484156b5B570BC4f92a</p>
        </Alert>
        <form className='text-center' onSubmit={(e) => {
        e.preventDefault()
        let referral = this.referral.value
        this.join(referral)
      }}>
        <Form.Group className="mb-3" controlId="referral">
          <Form.Label>Referral address</Form.Label>
          <Form.Control type="text" placeholder="Enter referral address" ref={(input) => { this.referral = input }} />
        </Form.Group>
        <Button variant="success" type="submit">JOIN SCHEME</Button>
      </form></div>
    }

    let balanceContent
    if (this.state.isParticipating) {
      balanceContent = 
      <div>
        <span>Total balance of the scheme is { this.state.totalBalance } ETH</span><br></br>
        <span>Your account balance in Khufu is { this.state.accountBalance } ETH</span>
      </div>
    } else {
      balanceContent = <span>You're currently not participating in Khufu.</span>
    }

    let connectionStatus
    if (!this.state.account) {
      connectionStatus = <Button onClick={(e) => this.connect(e)}>CONNECT</Button>
    }

    return (
      <div>
        {/* <NavBar account={this.state.account} /> */}
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="#home">Khufu</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                { this.state.account }
              </Navbar.Text>
              {connectionStatus}
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container className="p-3">
          <Container className="p-5 mb-4 bg-light rounded-3">
            <h1 className='text-center' >Khufu - A Decentralized Crypto Pyramid Scheme</h1>
            <hr></hr>
            <Stack gap={1}>
              <span>You have { this.state.tokenBalance } GIZA.</span>

              {balanceContent}
            </Stack><br></br>

            {content}<br></br>

            <Alert variant="danger" className='text-center'>
              <Alert.Heading>Attention</Alert.Heading>
              <p>A pyramid is a fraudulent scheme and should be not be considered a valid investment strategy.<br></br>
              This project was created for studying purposes only.</p>
              <hr></hr>
              <Alert.Heading>How it works?</Alert.Heading>
              <p>In order to join the scheme you have to pay 0.01 ETH. Once in the scheme, 10% of your admission 
                payment (0.0001 ETH) will be fowarded to your referral address. By joining the scheme you automatically earn
                1 GIZA. Think of the GIZA token as the merchandise that you get once you join a pyramid scheme.</p>
              <p>In order to make real money you'd have to sell your GIZA token for more than you paid for it (0.0001 ETH).
                But guess what, selling a GIZA token can be very difficult. You don't know where to sell or whom to sell it
                to. Soon you'll realize that getting more people to join the scheme is a lot more profitable than selling the
                merchandise (your GIZA tokens).</p>
                <p>And there you have it, a pyramid scheme. You are going to need to talk people into joining the scheme and
                  use your address as their referral address so you can earn your 10% fee from their admission payments.
                </p>
                <p>Any resemblance with the reality is mere coincidence. <span role="img" aria-label="smile-emoji">🙃 </span></p>
                <Alert.Heading>Deployment</Alert.Heading>
                <p>Khufu is deployed on the Kovan Test Network.</p>
                <Alert.Heading>Get ETH</Alert.Heading>
                <p>If you decide to test it you're going to need some ETH. You can get ETH direct to your wallet here {'->'} https://faucets.chain.link/kovan</p>
            </Alert>
          </Container>
        </Container>
      </div>
    );
  }
}

export default App;
