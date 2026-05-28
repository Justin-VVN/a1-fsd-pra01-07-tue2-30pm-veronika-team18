'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Text, useToast } from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const toast = useToast();

  const { currentUser, setCurrentUser } = useContext(AppContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error' });
      return;
    }

    // Get existing users or create empty array
    const users = JSON.parse(localStorage.getItem('vv_users') || '[]');

    // Check if email already exists
    if (users.find((u: any) => u.email === email)) {
      toast({ title: 'Email already registered', status: 'error' });
      return;
    }

    // Add new user
    users.push({ name, email, password, id: crypto.randomUUID() });
    localStorage.setItem('vv_users', JSON.stringify(users));

    // Auto-login after signup
    // localStorage.setItem('vv_currentUser', JSON.stringify({ name, email }));

    // toast({ title: 'Account created successfully!', status: 'success' });
    // setCurrentUser({ name, email });
    router.push('/signin'); // redirect to home
  };

  return (
    <Box maxW="400px" mx="auto" mt={12} p={8} boxShadow="lg" borderRadius="xl" bg="white">
      <Heading mb={6} textAlign="center" color="blue.600">Sign Up</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input value={name} name="fullName" onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </FormControl>

          <Button type="submit" colorScheme="blue" size="lg" w="full">
            Create Account
          </Button>

          <Text fontSize="sm">
            Already have an account?{' '}
            <Button variant="link" colorScheme="blue" onClick={() => router.push('/signin')}>
              Sign In
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}