'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Text, useToast } from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';
import { USER_API, apiFetch } from '@/lib/api';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { currentUser, setCurrentUser } = useContext(AppContext);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: 'Please fill in all fields', status: 'error' });
      return;
    }

    try {
      const { token, user: currUser } = await apiFetch<{ token: string; user: any }>(`${USER_API}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('authToken', token);
      setCurrentUser(currUser);
      
      toast({ 
        title: `Welcome back, ${currUser.fullName || currUser.email}!`, 
        status: 'success' 
      });

      if (currUser.type === 'vendor') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({ 
        title: 'Invalid email or password', 
        description: 'Please check your credentials and try again.', 
        status: 'error' 
      });
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={12} p={8} boxShadow="lg" borderRadius="xl" bg="white">
      <Heading mb={6} textAlign="center" color="blue.600">Sign In</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>

          <Button type="submit" colorScheme="blue" size="lg" w="full">
            Sign In
          </Button>

          <Text fontSize="sm">
            Don&apos;t have an account?{' '}
            <Button variant="link" colorScheme="blue" onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}