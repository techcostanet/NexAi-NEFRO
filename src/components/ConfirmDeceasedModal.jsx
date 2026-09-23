import React from 'react';
import PatientDischargeModal from './PatientDischargeModal.jsx';

/**
 * Wrapper de compatibilidade que redireciona para o novo PatientDischargeModal
 */
export default function ConfirmDeceasedModal(props) {
  return <PatientDischargeModal {...props} />;
}
