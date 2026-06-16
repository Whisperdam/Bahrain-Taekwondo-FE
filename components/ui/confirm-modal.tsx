"use client";

import { Modal } from "./modal";
import { PrimaryButton } from "./primary-button";
import { SecondaryButton } from "./secondary-button";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  loadingLabel?: string;
  /** Treat the confirm button as destructive. Currently uses flag-red which matches our brand. */
  danger?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  cancelLabel,
  loading,
  loadingLabel,
  danger,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      title={title}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={loading}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={onConfirm}
            loading={loading}
            loadingText={loadingLabel}
            className="w-auto px-4"
          >
            {confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      {body && (
        <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
      )}
      {/* The 'danger' flag is reserved for future restyling — kept here so callers can express intent */}
      {danger && <span className="sr-only">Destructive action</span>}
    </Modal>
  );
}
