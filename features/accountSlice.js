import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

const initialState = {
  address: null,
  networkId: null,
  provider: null,
  connected: false,
  balance: 0,
  usdtBalance: 0,
  loading: false,
}

const connectWallet = (provider) => {
  return new Promise(async (resolve, reject) => {
    try {
      await provider.send('eth_requestAccounts', [])
    } catch (error) {
      console.error(error)
    }

    try {
      const signer = provider.getSigner()
      resolve(signer.getAddress())
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

export const connectAccount = createAsyncThunk(
  'accounts/connect',
  async (walletType, { dispatch, getState }) => {
    const {
      infuraId,
      chainId,
      networkName,
      usdtContractAddress,
    } = getState().config

    const providerForWalletType = async (walletType) => {
      switch (walletType) {
        case 'metamask':
          return window.ethereum
        case 'walletconnect':
          const { default: WalletConnectProvider } = await import(
            '@walletconnect/web3-provider'
          )

          const walletConnectProvider = new WalletConnectProvider({
            infuraId: infuraId,
            chainId: chainId,
          })

          await walletConnectProvider.enable()
          return walletConnectProvider
        case 'coinbase':
          const { default: WalletLink } = await import('walletlink')
          const walletLink = new WalletLink({
            appName: 'Gasvard Web3 Auth',
            darkMode: false,
          })

          return walletLink.makeWeb3Provider(
            `https://${networkName}.infura.io/v3/${infuraId}`,
            chainId,
          )
      }
    }

    const provider = new ethers.providers.Web3Provider(
      await providerForWalletType(walletType),
    )

    connectWallet(provider).then(async (currentAddress) => {
      let address = currentAddress
      let networkId = (await provider.getNetwork()).chainId
      let signer = await provider.getSigner()
      let balance = await signer.getBalance()

      const contract = new ethers.Contract(usdtContractAddress, [
        'function balanceOf(address owner) view returns (uint balance)',
      ]).connect(signer)

      const usdtBalance = await contract.balanceOf(address)

      dispatch(
        connected({ address, networkId, provider, balance, usdtBalance }),
      )
    })

    ethereum.on('accountsChanged', (accounts) => {
      dispatch(updated({ address: accounts[0] }))
    })

    ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  },
)

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(connectAccount.pending, (state, _action) => {
      state.loading = true
    })
    builder.addCase(connectAccount.fulfilled, (state, _action) => {
      state.loading = false
    })
    builder.addCase(connectAccount.rejected, (state, _action) => {
      state.loading = false
    })
  },
  reducers: {
    updated: (state, { payload }) => {
      Object.assign(state, payload)
    },
    connected: (state, { payload }) => {
      state.address = payload.address
      state.networkId = payload.networkId
      state.provider = payload.provider
      state.balance = payload.balance
      state.usdtBalance = payload.usdtBalance
      state.connected = true
    },
  },
})

export const {
  connecting,
  connected,
  connectionFailed,
  updated,
} = accountSlice.actions

export default accountSlice.reducer
