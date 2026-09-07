import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Plus, X, Check, Search, AlertCircle } from 'lucide-react';
import { subscribeToAllergiesCatalog, addGlobalAllergy, ALLERGIES_PADRAO } from '../services/patientService';

export default function AllergySelector({ selectedAllergies = [], onChange, label = "Alergias Medicamentosas & Gerais" }) {
  const [catalog, setCatalog] = useState(ALLERGIES_PADRAO);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToAllergiesCatalog((list) => {
      setCatalog(list);
    });
    return () => unsub();
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeSelected = Array.isArray(selectedAllergies) ? selectedAllergies : [];

  const handleToggle = (item) => {
    if (safeSelected.includes(item)) {
      onChange(safeSelected.filter(a => a !== item));
    } else {
      onChange([...safeSelected, item]);
    }
  };

  const handleRemove = (item, e) => {
    e.stopPropagation();
    onChange(safeSelected.filter(a => a !== item));
  };

  const handleAddNewAllergy = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setAddingNew(true);
    try {
      // Cadastra no Cloud Firestore para catálogo global
      await addGlobalAllergy(trimmed);
      // Adiciona ao paciente atual se ainda não estiver
      if (!safeSelected.includes(trimmed)) {
        onChange([...safeSelected, trimmed]);
      }
      setSearchTerm('');
      setIsOpen(false);
    } catch (err) {
      console.error("Erro ao adicionar nova alergia:", err);
    } finally {
      setAddingNew(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && filteredOptions[0].toLowerCase() === searchTerm.trim().toLowerCase()) {
        handleToggle(filteredOptions[0]);
        setSearchTerm('');
      } else if (searchTerm.trim()) {
        handleAddNewAllergy();
      }
    }
  };

  const filteredOptions = catalog.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exactMatchExists = catalog.some(
    item => item.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  return (
    <div className="flex flex-col gap-1.5" ref={dropdownRef} style={{ position: 'relative' }}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold mb-1 flex items-center gap-1.5 text-slate-800">
          <ShieldAlert size={14} color="#dc2626" />
          <span>{label}</span>
        </label>
        {safeSelected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Limpar todas
          </button>
        )}
      </div>

      {/* Lista de Alergias Selecionadas (Chips) */}
      <div 
        className="p-2 rounded-xl border flex flex-wrap gap-1.5 items-center min-h-[42px]"
        style={{ 
          background: safeSelected.length > 0 ? '#fef2f2' : '#f8fafc',
          borderColor: safeSelected.length > 0 ? '#fecaca' : 'var(--border)'
        }}
      >
        {safeSelected.length === 0 ? (
          <span className="text-xs text-muted italic px-1">
            Nenhuma alergia relatada (Clique abaixo para selecionar ou cadastrar)
          </span>
        ) : (
          safeSelected.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold animate-in"
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #f87171'
              }}
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(item, e)}
                className="hover:text-red-950 transition ml-0.5"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex' }}
                title={`Remover alergia a ${item}`}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Input de Busca e Adição */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input-field"
              placeholder="Pesquisar ou digitar nova alergia (Ex: Cefazolina, Vancomicina...)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
            />
          </div>

          {searchTerm.trim() && !exactMatchExists && (
            <button
              type="button"
              onClick={handleAddNewAllergy}
              disabled={addingNew}
              className="btn btn-primary"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
              title="Salvar esta nova alergia no Firestore para todos os pacientes"
            >
              <Plus size={14} />
              <span>{addingNew ? 'Salvando...' : 'Adicionar ao Catálogo'}</span>
            </button>
          )}
        </div>

        {/* Dropdown com opções cadastradas no Firestore */}
        {isOpen && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: '220px',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              padding: '0.4rem'
            }}
          >
            {searchTerm.trim() && !exactMatchExists && (
              <div
                onClick={handleAddNewAllergy}
                className="p-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-red-50 text-red-700 flex items-center justify-between border-b mb-1"
                style={{ borderColor: '#fee2e2' }}
              >
                <div className="flex items-center gap-2">
                  <Plus size={14} color="#dc2626" />
                  <span>Cadastrar nova alergia: <strong>"{searchTerm.trim()}"</strong></span>
                </div>
                <span className="text-[10px] text-muted uppercase">Salvar na Nuvem</span>
              </div>
            )}

            {filteredOptions.length === 0 && !searchTerm.trim() ? (
              <div className="p-3 text-center text-xs text-muted">
                Nenhuma alergia no catálogo.
              </div>
            ) : filteredOptions.length === 0 && searchTerm.trim() ? (
              <div className="p-2.5 text-center text-xs text-slate-500">
                Pressione <strong>Enter</strong> ou clique em "+ Adicionar ao Catálogo" para cadastrar.
              </div>
            ) : (
              filteredOptions.map((item, idx) => {
                const isSelected = safeSelected.includes(item);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggle(item)}
                    className="p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition"
                    style={{
                      background: isSelected ? '#fee2e2' : 'transparent',
                      color: isSelected ? '#991b1b' : '#334155',
                      fontWeight: isSelected ? '600' : 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert size={13} color={isSelected ? '#dc2626' : '#94a3b8'} />
                      <span>{item}</span>
                    </span>
                    {isSelected && <Check size={14} color="#dc2626" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
