'use client'

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useRouter } from 'next/navigation';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.2; }
`

export default function Home() {
  const router = useRouter();
  
  return (
    <Box minH="100vh" bg="black">
      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, sm: 6, lg: 8 }}
      >
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, purple.900/20, black)"
          zIndex={0}
        />
        
        <Container maxW="4xl" position="relative" zIndex={1} textAlign="center">
          <Heading
            as="h1"
            fontSize={{ base: '6xl', sm: '8xl' }}
            fontWeight="bold"
            color="white"
            minH={{ base: '140px', sm: '140px' }}
          >
            Snek Rumble
          </Heading>
          <Text
            fontSize={{ base: 'xl', sm: '2xl' }}
            color="gray.300"
            mb={8}
            maxW="2xl"
            mx="auto"
          >
            Enter the world's first crypto-powered snake battle royale. 
            Compete, collect, and conquer in this thrilling multiplayer arena.
          </Text>
          <Button
            size="lg"
            bgGradient="linear(to-r, purple.500, pink.500)"
            _hover={{
              bgGradient: 'linear(to-r, purple.600, pink.600)',
              transform: 'scale(1.05)',
            }}
            transition="all 0.2s"
            rounded="full"
            px={8}
            py={4}
            fontSize="lg"
            onClick={() => {
              router.push('/arena');
            }}
          >
            Enter the Arena
          </Button>
        </Container>

        {/* Decorative snake elements */}
        <HStack
          position="absolute"
          bottom={10}
          left={0}
          right={0}
          justifyContent="center"
          gap={4}
          opacity={0.2}
        >
          <Box
            w={16}
            h={16}
            borderWidth={2}
            borderColor="purple.500"
            rounded="full"
            animation={`${pulse} 2s infinite`}
          />
          <Box
            w={12}
            h={12}
            borderWidth={2}
            borderColor="pink.500"
            rounded="full"
            animation={`${pulse} 2s infinite 0.5s`}
          />
          <Box
            w={8}
            h={8}
            borderWidth={2}
            borderColor="red.500"
            rounded="full"
            animation={`${pulse} 2s infinite 1s`}
          />
        </HStack>
      </Box>

      {/* How It Works Section */}
      <Box
        as="section"
        py={20}
        px={{ base: 4, sm: 6, lg: 8 }}
        bgGradient="linear(to-b, black, purple.900/10)"
      >
        <Container maxW="6xl">
          <Heading as="h2" fontSize="4xl" textAlign="center" mb={16}>
            How It Works
          </Heading>
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={8}
          >
            {[
              {
                title: '1. Connect & Deposit',
                description: 'Connect your wallet and deposit MON tokens to enter the arena.',
                color: 'purple.400',
              },
              {
                title: '2. Battle Royale',
                description: 'Navigate the arena, grow your snake, and outmaneuver other players.',
                color: 'pink.400',
              },
              {
                title: '3. Collect Rewards',
                description: 'Collect glowing food from fallen players and claim their deposits.',
                color: 'red.400',
              },
            ].map((step, index) => (
              <Box
                key={index}
                bg="whiteAlpha.100"
                p={6}
                rounded="xl"
                backdropFilter="blur(10px)"
              >
                <Heading
                  as="h3"
                  fontSize="2xl"
                  color={step.color}
                  mb={4}
                >
                  {step.title}
                </Heading>
                <Text color="gray.300">{step.description}</Text>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Leaderboard Section */}
      <Box
        as="section"
        py={20}
        px={{ base: 4, sm: 6, lg: 8 }}
        bgGradient="linear(to-b, purple.900/10, black)"
      >
        <Container maxW="4xl">
          <Heading as="h2" fontSize="4xl" textAlign="center" mb={12}>
            Top Players
          </Heading>
          <Box bg="whiteAlpha.100" rounded="xl" backdropFilter="blur(10px)" p={6}>
            <VStack gap={4}>
              {[1, 2, 3, 4, 5].map((rank) => (
                <Flex
                  key={rank}
                  w="full"
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="whiteAlpha.100"
                  rounded="lg"
                >
                  <HStack gap={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.400">
                      #{rank}
                    </Text>
                    <Box
                      w={8}
                      h={8}
                      rounded="full"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                    />
                    <Text fontWeight="medium">Player{rank}</Text>
                  </HStack>
                  <Text color="purple.400" fontWeight="bold">
                    {1000 - rank * 100} MON
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
