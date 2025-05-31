'use client'

import {
  Box,
  Button,
  Stack,
  Text,
  useDisclosure,
  Portal,
  CloseButton,
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useGame } from '../hooks/useGame'

export function GameConnect() {
  const {
    isConnected,
    playerStake,
    isAlive,
    handleJoinGame,
    isJoining,
    joinSuccess,
    betSize,
    error,
  } = useGame()

  const { open, onOpen, onClose } = useDisclosure()

  // Reset join success when modal closes
  const handleClose = () => {
    onClose()
  }

  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      textAlign="center"
      zIndex={10}
    >
      {!isConnected ? (
        <ConnectButton />
      ) : isAlive ? (
        <></>
      ) : (
        <Button
          size="lg"
          bgGradient="linear(to-r, purple.500, pink.500)"
          _hover={{
            bgGradient: 'linear(to-r, purple.600, pink.600)',
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
          onClick={onOpen}
        >
          Join Game
        </Button>
      )}

      {open && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.700"
            backdropFilter="blur(10px)"
            zIndex={20}
            onClick={handleClose}
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              p={6}
              rounded="xl"
              maxW="md"
              w="full"
              onClick={(e) => e.stopPropagation()}
            >
              <Box position="relative">
                <Text fontSize="2xl" fontWeight="bold" mb={4}>
                  Join Snek Rumble
                </Text>
                <CloseButton
                  position="absolute"
                  right={0}
                  top={0}
                  onClick={handleClose}
                />
              </Box>
              <Stack gap={4}>
                {error && (
                  <Box
                    bg="red.500"
                    color="white"
                    p={3}
                    rounded="md"
                    fontSize="sm"
                  >
                    {error}
                  </Box>
                )}
                <Text>
                  Join the game with a bet of{' '}
                  <Text as="span" fontWeight="bold" color="purple.400">
                    {betSize} MON
                  </Text>
                </Text>
                <Button
                  colorScheme="purple"
                  onClick={handleJoinGame}
                  loading={isJoining}
                  loadingText="Joining..."
                  w="full"
                >
                  Deposit & Join
                </Button>
                {joinSuccess && (
                  <Box
                    bg="green.500"
                    color="white"
                    p={3}
                    rounded="md"
                    fontSize="sm"
                  >
                    Successfully joined the game!
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  )
} 