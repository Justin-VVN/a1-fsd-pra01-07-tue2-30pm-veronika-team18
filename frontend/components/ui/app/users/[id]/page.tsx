'use client';

import { AppContext } from '@/app/store/ContextProvider';
import { use, useId } from 'react';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
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

  const onSave = (evt) => {
    evt.preventDefault();

    const updatedUserFormData = Object.fromEntries(
      new FormData(evt.currentTarget).entries(),
    );

    const lsUsers = localStorage.getItem('vv_users') || '[]';
    try {
      const users = JSON.parse(lsUsers);

      const userIndex = users.findIndex((usr) => usr.id === currentUser.id);
      // if (!foundUser) throw new Error('User error');

      // update the info for the current user inside the users list
      const updatedUser = { ...users[userIndex], ...updatedUserFormData };
      users[userIndex] = updatedUser;

      // if (duplicatedUser) throw new Error('Duplicated user');

      // users.push(newUser);
      localStorage.setItem('vv_users', JSON.stringify(users));

      const { password, ...curUsr } = updatedUser;
      setCurrentUser(curUsr);
      localStorage.setItem('vv_currentUser', JSON.stringify(curUsr));

      toast({
        title: 'Updated info succesfully',
        // description: "We've created your account for you.",
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='px-32'>
      <form onSubmit={onSave}>
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