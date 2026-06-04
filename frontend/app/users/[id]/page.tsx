'use client';

import { AppContext } from '@/app/store/ContextProvider';
import { use } from 'react';
import { USER_API, apiFetch } from '@/lib/api';

import {
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const toast = useToast();
  const { currentUser, setCurrentUser } = use(AppContext);

  const onSave = async (evt) => {
    evt.preventDefault();

    const updatedUserFormData = Object.fromEntries(
      new FormData(evt.currentTarget).entries(),
    );

    try {
      const updatedUser = await apiFetch<any>(`${USER_API}/users/${currentUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedUserFormData),
      });

      const { password, ...curUsr } = updatedUser;
      setCurrentUser(curUsr);

      toast({
        title: 'Updated info successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (e) {
      console.error('Failed to update user:', e);
      toast({
        title: 'Failed to update',
        description: 'Could not save user information',
        status: 'error',
      });
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='px-32'>
      <form onSubmit={onSave}>
        <FormControl>
         <FormLabel>Date Account Was Created</FormLabel>
         <Input
          isReadOnly
           value={
           currentUser.dateJoined
            ? new Date(currentUser.dateJoined).toLocaleDateString()
            : ''
           }
          />
         </FormControl>
        <FormControl>
          <FormLabel>User ID</FormLabel>
          <Input type='text' name='id' disabled defaultValue={currentUser.id} />
        </FormControl>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input type='text' name='name' defaultValue={currentUser.name} />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type='email' name='email' defaultValue={currentUser.email} />
        </FormControl>
        <FormControl>
          <FormLabel>Phone Number</FormLabel>
          <Input
            type='text'
            name='phoneNumber'
            defaultValue={currentUser.phoneNumber}
          />
        </FormControl>
        {/* <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type='password' name='password' />
        </FormControl> */}
        <Button mt={4} colorScheme='blue' type='submit'>
          Save
        </Button>
      </form>
    </div>
  );
}