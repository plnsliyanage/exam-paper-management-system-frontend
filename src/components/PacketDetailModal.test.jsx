import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import PacketDetailModal from './PacketDetailModal';
import axiosInstance from '../api/axiosInstance';

let mockAuthUser = { username: 'prof_smith', fullName: 'Prof. Alice Smith', role: 'ROLE_USER' };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    getUsername: () => mockAuthUser.username,
    getRole: () => mockAuthUser.role,
    user: mockAuthUser,
  }),
}));

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('PacketDetailModal Context-Aware Actions', () => {
  const mockPacket = {
    id: 101,
    courseCode: 'CS301',
    courseName: 'Operating Systems',
    department: 'Computer Science',
    status: 'SUBMITTED_FOR_MODERATION',
    lecturerUsername: 'john_doe',
    lecturerName: 'Dr. John Doe',
    moderatorUsername: 'prof_smith',
    moderatorName: 'Prof. Alice Smith',
  };

  it('renders Approve and Reject moderation buttons when logged in as assigned moderator', async () => {
    mockAuthUser = { username: 'prof_smith', fullName: 'Prof. Alice Smith', role: 'ROLE_USER' };
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/packets/101/history')) return Promise.resolve({ data: [] });
      if (url.includes('/packets/101/comments')) return Promise.resolve({ data: [] });
      if (url.includes('/printing/packet/101')) return Promise.resolve({ data: null });
      return Promise.resolve({ data: mockPacket });
    });

    const onStatusUpdate = vi.fn();
    const onClose = vi.fn();

    render(
      <PacketDetailModal
        packetId={101}
        onClose={onClose}
        onStatusUpdate={onStatusUpdate}
        isOpen={true}
      />
    );

    // Context badge should indicate Moderator Review
    await waitFor(() => {
      expect(screen.getByText(/Moderator Review Mode/i)).toBeInTheDocument();
    });

    // Approve & Reject buttons should be visible
    expect(screen.getByRole('button', { name: /Approve Paper/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Revision/i })).toBeInTheDocument();
  });

  it('renders Author view without moderation approve/reject buttons when logged in as course lecturer', async () => {
    mockAuthUser = { username: 'john_doe', fullName: 'Dr. John Doe', role: 'ROLE_USER' };
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/packets/101/history')) return Promise.resolve({ data: [] });
      if (url.includes('/packets/101/comments')) return Promise.resolve({ data: [] });
      if (url.includes('/printing/packet/101')) return Promise.resolve({ data: null });
      return Promise.resolve({ data: mockPacket });
    });

    const onStatusUpdate = vi.fn();
    const onClose = vi.fn();

    render(
      <PacketDetailModal
        packetId={101}
        onClose={onClose}
        onStatusUpdate={onStatusUpdate}
        isOpen={true}
      />
    );

    // Context badge should indicate Course Lecturer
    await waitFor(() => {
      expect(screen.getByText(/Course Lecturer/i)).toBeInTheDocument();
    });

    // Moderator action buttons should NOT be present for the author
    expect(screen.queryByRole('button', { name: /Approve Paper/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Request Revision/i })).not.toBeInTheDocument();
  });
});
