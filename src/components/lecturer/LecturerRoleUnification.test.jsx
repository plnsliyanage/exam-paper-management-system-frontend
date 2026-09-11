import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import TaskFilterTabs from './TaskFilterTabs';
import PacketCard from './PacketCard';
import { sidebarMenus } from '../../config/sidebarMenus';

let mockAuthUser = { username: 'john_doe', role: 'ROLE_USER' };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    getUsername: () => mockAuthUser.username,
    getRole: () => mockAuthUser.role,
    user: mockAuthUser,
  }),
}));

describe('Sidebar Menu Configuration for Unified Roles', () => {
  it('provides identical full menu access for ROLE_USER and ROLE_MODERATOR', () => {
    expect(sidebarMenus.ROLE_USER).toBeDefined();
    expect(sidebarMenus.ROLE_MODERATOR).toBeDefined();
    expect(sidebarMenus.ROLE_USER.title).toBe('Lecturer');
    expect(sidebarMenus.ROLE_MODERATOR.title).toBe('Lecturer');
    expect(sidebarMenus.ROLE_USER.items.length).toBe(sidebarMenus.ROLE_MODERATOR.items.length);
  });
});

describe('TaskFilterTabs Role Scopes', () => {
  it('renders teaching vs moderating role scope tabs and triggers callback on click', () => {
    const onScopeChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <TaskFilterTabs
        roleScope="SCOPE_ALL"
        onScopeChange={onScopeChange}
        taskFilter="ALL"
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText(/All Packets/i)).toBeInTheDocument();
    expect(screen.getByText(/Teaching \(Author\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Moderating \(Review\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Moderating \(Review\)/i));
    expect(onScopeChange).toHaveBeenCalledWith('SCOPE_MODERATION');

    fireEvent.click(screen.getByText(/Teaching \(Author\)/i));
    expect(onScopeChange).toHaveBeenCalledWith('SCOPE_AUTHORED');
  });
});

describe('PacketCard Context-Aware Role Behavior', () => {
  const basePacket = {
    id: 101,
    courseCode: 'CS301',
    courseName: 'Operating Systems',
    department: 'Computer Science',
    status: 'SUBMITTED_FOR_MODERATION',
    statusName: 'SUBMITTED_FOR_MODERATION',
    lecturerUsername: 'john_doe',
    lecturerName: 'Dr. John Doe',
    moderatorUsername: 'prof_smith',
    moderatorName: 'Prof. Alice Smith',
  };

  it('renders Moderator badge and "Review & Decide" action for assigned moderator', () => {
    mockAuthUser = { username: 'prof_smith', role: 'ROLE_USER' };
    const onSelectDetail = vi.fn();

    render(
      <PacketCard
        packet={basePacket}
        onSelectDetail={onSelectDetail}
      />
    );

    // Should indicate Moderator context badge
    expect(screen.getByText(/Moderator/i)).toBeInTheDocument();
    
    // Should show Review & Decide button for submitted packet
    const reviewBtn = screen.getByRole('button', { name: /Review & Decide/i });
    expect(reviewBtn).toBeInTheDocument();

    fireEvent.click(reviewBtn);
    expect(onSelectDetail).toHaveBeenCalledWith(101);
  });

  it('renders Author badge and author workflow state for course lecturer', () => {
    mockAuthUser = { username: 'john_doe', role: 'ROLE_USER' };
    const onSelectDetail = vi.fn();

    render(
      <PacketCard
        packet={basePacket}
        onSelectDetail={onSelectDetail}
      />
    );

    // Should indicate Author context badge
    expect(screen.getByText(/Author/i)).toBeInTheDocument();
    // In submitted state, author waits for moderation review
    expect(screen.getAllByText(/In Moderation/i).length).toBeGreaterThan(0);
  });
});
