import React from 'react';
import { render, screen } from '@testing-library/react';
import UserList from './UserList';

describe('UserList Component', () => {
  // Clear the DOM between tests to avoid conflicts
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const mockUsers = [
    { username: 'user1', colour: '#ff0000' },
    { username: 'user2', colour: '#00ff00' },
    { username: 'user3', colour: '#0000ff' }
  ];
  
  test('renders empty state when no users provided', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText('No active users')).toBeInTheDocument();
  });
  
  test('renders empty state when users is null or undefined', () => {
    // We'll use a clean render for each variant to avoid conflicts
    const { unmount } = render(<UserList users={null} />);
    expect(screen.getByText('No active users')).toBeInTheDocument();

    // Unmount the previous component before rendering the next one
    unmount();
    render(<UserList users={undefined} />);
    expect(screen.getByText('No active users')).toBeInTheDocument();
  });
  
  test('renders user icons for each user', () => {
    const testUsers = [
      { username: 'John Doe', colour: '#ff0000' },
      { username: 'Jane Smith', colour: '#00ff00' }
    ];
    
    render(<UserList users={testUsers} />);
    
    // Check for user initials
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });
  
  test('generates correct user initials', () => {
    const testUsers = [
      { username: 'John Doe', colour: '#ff0000' },
      { username: 'Jane', colour: '#00ff00' },
      { username: 'Robert John Smith', colour: '#0000ff' }
    ];
    
    render(<UserList users={testUsers} />);
    
    // Check for correct initials
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('RJ')).toBeInTheDocument();
  });
  
  test('shows overflow count when more than MAX_VISIBLE users', () => {
    // Create 7 users (MAX_VISIBLE is 5)
    const testUsers = Array.from({ length: 7 }, (_, i) => ({
      username: `User ${i+1}`,
      colour: `#${i}${i}${i}`
    }));
    
    render(<UserList users={testUsers} />);
    
    // Check for +2 overflow indicator
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
  
  test('handles users with missing username or colour', () => {
    const testUsers = [
      { username: undefined, colour: '#ff0000' },
      { username: 'Jane', colour: undefined }
    ];
    
    render(<UserList users={testUsers} />);
    
    // Check for placeholder for missing username
    expect(screen.getByText('?')).toBeInTheDocument();
    // Check Jane still renders properly
    expect(screen.getByText('J')).toBeInTheDocument();
  });
  
  test('tooltip contains all users', () => {
    // Create 7 users (MAX_VISIBLE is 5)
    const testUsers = Array.from({ length: 7 }, (_, i) => ({
      username: `User ${i+1}`,
      colour: `#${i}${i}${i}`
    }));
    
    render(<UserList users={testUsers} />);
    
    // Check tooltip header exists
    expect(screen.getByText('All Users')).toBeInTheDocument();
    
    // Check all usernames appear in the tooltip
    testUsers.forEach(user => {
      expect(screen.getByText(user.username)).toBeInTheDocument();
    });
  });
});