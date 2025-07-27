import { useState, useCallback } from "react";
import ConfirmModal from "./ConfirmModal";

export function useConfirmModal() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<React.ReactNode>(""); 
  const [promiseResolver, setPromiseResolver] = useState<(value: boolean) => void>();

  const requestConfirmation = useCallback((msg: string | React.ReactNode): Promise<boolean> => {
    setMessage(msg);
    setShow(true);

    return new Promise((resolve) => {
      setPromiseResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setShow(false);
    promiseResolver?.(true);
  }, [promiseResolver]);

  const handleCancel = useCallback(() => {
    setShow(false);
    promiseResolver?.(false);
  }, [promiseResolver]);

  const modal = (
    <ConfirmModal
      show={show}
      message={message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { requestConfirmation, modal };
}
