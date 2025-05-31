'use client'

import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Stack,
  HStack,
} from '@chakra-ui/react'
import { GameConnect } from '../components/GameConnect'
import { useGame } from '../hooks/useGame'
import { formatEther } from 'viem'
import GameCanvas from '../components/GameCanvas'

export default function ArenaPage() {
  const { isConnected, isAlive, playerStake } = useGame()

  return (
    <Box minH="100vh" bg="black" position="relative">
      {/* Game Arena Background */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-b, purple.900/20, black)"
        zIndex={0}
      />

      {/* Game Stats */}
      {isConnected && (
        <Box
          position="fixed"
          top={4}
          right={4}
          zIndex={10}
          bg="whiteAlpha.100"
          backdropFilter="blur(10px)"
          p={4}
          rounded="xl"
        >
          <Stack gap={4}>
            <Box>
              <Text color="gray.400" fontSize="sm">Status</Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={isAlive ? 'green.400' : 'red.400'}
              >
                {isAlive ? 'In Game' : 'Not Playing'}
              </Text>
            </Box>
            {playerStake && (
              <Box>
                <Text color="gray.400" fontSize="sm">Current Stake</Text>
                <Text fontSize="xl" fontWeight="bold" color="purple.400">
                  {formatEther(playerStake)} MON
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Your deposit in the game
                </Text>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* Game Connection UI */}
      <GameConnect />

      {/* Game Arena Content */}
      <Container maxW="container.xl" position="relative" zIndex={1} py={8}>
        {!isConnected ? (
          <Box textAlign="center" mt={20}>
            <Heading
              as="h1"
              fontSize="4xl"
              color="white"
              mb={4}
            >
              Welcome to Snek Rumble
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Connect your wallet to enter the arena
            </Text>
          </Box>
        ) : !isAlive ? (
          <Box textAlign="center" mt={20}>
            <Heading
              as="h1"
              fontSize="4xl"
              color="white"
              mb={4}
            >
              Ready to Rumble?
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Deposit MON tokens to join the game
            </Text>
          </Box>
        ) : (
          <Box>
            {/* Game canvas will go here */}
            <GameCanvas />
          </Box>
        )}
      </Container>
    </Box>
  )
}
