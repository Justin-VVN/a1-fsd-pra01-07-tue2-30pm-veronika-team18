import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';

// per-test
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     refresh: jest.fn(),
//     back: jest.fn(),
//     forward: jest.fn(),
//     prefetch: jest.fn(),
//   }),
//   usePathname: () => '/signup',
//   useSearchParams: () => new URLSearchParams(),
// }));

describe('Test Signup Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('creates new user will save into localStorage', async () => {
    render(<SignUpPage />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Justin');
    await userEvent.type(screen.getByLabelText(/email/i), 'justin@test.com');
    // await userEvent.type(screen.getByLabelText(/^password$/i), 'abc');
    // await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc');
    await userEvent.type(
      document.querySelector('input[name="password"]')!,
      'abc',
    );
    await userEvent.type(
      document.querySelector('input[name="confirmPassword"]')!,
      'abc',
    );

    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    console.log('>> LS:', localStorage.getItem('vv_users'));

    const users = JSON.parse(localStorage.getItem('vv_users') || '[]');

    expect(users[0]).toEqual(
      expect.objectContaining({
        name: 'Justin',
        email: 'justin@test.com',
        password: 'abc',
      }),
    );

    expect(users[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );
  });
});
