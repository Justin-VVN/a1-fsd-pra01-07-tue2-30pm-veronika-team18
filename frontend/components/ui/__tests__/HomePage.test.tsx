import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page';
 
// test suite: many test cases

describe('Test HomePage', () => {
  it('renders the hero text h1', () => {
    render(<HomePage />)
 
    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toBeInTheDocument()
  });

  it('the heading "Venue Vendors" exists in the hero', () => {
    render(<HomePage />);

    const h1 = screen.getByRole('heading', { level: 1 });

    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toEqual('Venue Vendors');
  });

});
