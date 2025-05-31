'use client'

import { useAccount, useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi'
import { parseEther } from 'viem'
import { useState, useEffect } from 'react'

// Update with your deployed contract address
const GAME_CONTRACT = '0x88B9ca362Cd67C758D1cA4950FFF177c4fCcaC94' // This should be your actual deployed contract address
const BET_SIZE = process.env.NEXT_PUBLIC_BET_SIZE || '0.1' // Default to 0.1 MON if not set

const gameABI = [
  {
    inputs: [],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'stakes',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'isAlive',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Joined',
    type: 'event',
  },
] as const

export function useGame() {
  const { address, isConnected } = useAccount()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read player's stake
  const { data: playerStake } = useReadContract({
    address: GAME_CONTRACT as `0x${string}`,
    abi: gameABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read if player is alive
  const { data: isAlive } = useReadContract({
    address: GAME_CONTRACT as `0x${string}`,
    abi: gameABI,
    functionName: 'isAlive',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Write function to join game
  const { writeContract, isPending: isJoining } = useWriteContract()

  // Watch for join success
  useWatchContractEvent({
    address: GAME_CONTRACT as `0x${string}`,
    abi: gameABI,
    eventName: 'Joined',
    onLogs: (logs) => {
      const event = logs[0]
      if (event && 'args' in event && event.args.player === address) {
        setJoinSuccess(true)
        setIsDepositModalOpen(false)
      }
    },
  })

  // Reset join success state when modal is closed
  useEffect(() => {
    if (!isDepositModalOpen) {
      setJoinSuccess(false)
    }
  }, [isDepositModalOpen])

  const handleJoinGame = async () => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setError(null)
      const result = await writeContract({
        address: GAME_CONTRACT as `0x${string}`,
        abi: gameABI,
        functionName: 'joinGame',
        value: parseEther(BET_SIZE),
      })
      
      console.log('Join game transaction:', result)
    } catch (error) {
      console.error('Error joining game:', error)
      setError(error instanceof Error ? error.message : 'Failed to join game')
    }
  }

  return {
    isConnected,
    address,
    isDepositModalOpen,
    setIsDepositModalOpen,
    playerStake,
    isAlive,
    handleJoinGame,
    isJoining,
    joinSuccess,
    betSize: BET_SIZE,
    error,
  }
} 