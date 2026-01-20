/**
 * Modal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        Modal content
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Modal content
      </Modal>
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked if closeOnOverlayClick is true', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        Modal content
      </Modal>
    );

    // Click on the overlay (the backdrop)
    const overlay = screen.getByRole('dialog').parentElement?.querySelector('.bg-black\\/60');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not call onClose when overlay is clicked if closeOnOverlayClick is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        Modal content
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement?.querySelector('.bg-black\\/60');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key press if closeOnEscape is true', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={true}>
        Modal content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not call onClose on Escape key press if closeOnEscape is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        Modal content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        Modal content
      </Modal>
    );

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
        Modal content
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
