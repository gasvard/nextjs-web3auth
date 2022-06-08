import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { connectAccount } from '../features/accountSlice'
import { BigNumber, utils } from 'ethers'

const WalletListItem = styled.li.attrs({
  className: 'px-2 py-1 hover:bg-blue-600 cursor-pointer rounded-md',
})``

export const formatAddress = (address, padding = 4) => {
  if (address && address.length > 0) {
    return `${address.substr(0, padding + 2)}…${address.substr(padding * -1)}`
  } else {
    return address
  }
}

export const formatBalance = (balanceInWei) => {
  return parseFloat(utils.formatEther(BigNumber.from(balanceInWei))).toFixed(4)
}

export default function ConnectWallet(props) {
  const dispatch = useDispatch()

  function onWalletListItemClick(walletName) {
    return ({ target }) => {
      dispatch(connectAccount(walletName))
      target.parentElement.parentElement.removeAttribute('open')
    }
  }

  return (
    <details className="bg-blue-500 rounded-md text-white font-mono uppercase group">
      <summary className="cursor-pointer px-2 group-open:bg-amber-400 py-1 font-semibold rounded-t-md flex justify-between items-center">
        <span className="group-open:hidden">{props.label}</span>
        <span className="group-open:block hidden">Pick Wallet</span>
        <span className="group-open:block hidden">&times;</span>
      </summary>

      <ul className="border-t border-amber-500">
        <WalletListItem onClick={onWalletListItemClick('metamask')}>
          Metamask
        </WalletListItem>
        <WalletListItem onClick={onWalletListItemClick('walletconnect')}>
          WalletConnect
        </WalletListItem>
        <WalletListItem onClick={onWalletListItemClick('coinbase')}>
          Coinbase
        </WalletListItem>
      </ul>
    </details>
  )
}
