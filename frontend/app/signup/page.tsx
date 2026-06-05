'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Text, useToast, Select } from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';
import { USER_API, apiFetch } from '@/lib/api';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<'hirer' | 'vendor'>('hirer'); 

  const { currentUser, setCurrentUser } = useContext(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error' });
      return;
    }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

     if (!passwordRegex.test(password)) {
       toast({
       title: 'Password is too weak',
        description:
      'Password must be at least 6 characters, have uppercase, lowercase, and a special character.',
       status: 'error',
       });
     return;
     }


    if (!name || !email || !password) {
      toast({ title: 'Please fill in all fields', status: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          type: role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ 
          title: 'Sign up failed', 
          description: error.message || 'An error occurred', 
          status: 'error' 
        });
        return;
      }

      const newUser = await response.json();
      toast({ 
        title: 'Account created successfully!', 
        status: 'success' 
      });

      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);

      router.push('/signin');
    } catch (error) {
      console.error('Signup error:', error);
      toast({ 
        title: 'Network error', 
        description: 'Could not connect to server. Make sure the backend is running on port 3001.', 
        status: 'error' 
      });
    }
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
           <FormLabel>Account Type</FormLabel>
           <Select value={role} onChange={(e) => setRole(e.target.value as 'hirer' | 'vendor')}>
           <option value="hirer">Hirer</option>
           <option value="vendor">Vendor</option>
          </Select>
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