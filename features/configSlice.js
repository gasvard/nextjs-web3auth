import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
  name: '',
  infuraId: '',
  chainId: '',
  networkName: '',
  usdtContractAddress: '',
}

export const loadConfig = createAsyncThunk(
  'config/load',
  async (_, { dispatch }) => {
    fetch('/api/config')
      .then((response) => response.json())
      .then((json) => dispatch(received(json)))
  },
)

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    received: (state, { payload }) => {
      state.name = payload.name
      state.infuraId = payload.infura_id
      state.chainId = payload.chain_id
      state.networkName = payload.network_name
      state.usdtContractAddress = payload.usdt_contract_address
    },
  },
})

export const { received } = configSlice.actions

export default configSlice.reducer
