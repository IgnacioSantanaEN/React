import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddProductForm from '../AddProduct.jsx';

describe('AddProductForm', () => {
  it('muestra aviso cuando no hay archivos y se pulsa subir', async () => {
    render(<AddProductForm />);
    const btn = screen.getByRole('button', { name: /subir producto/i });
    fireEvent.click(btn);
    const aviso = await screen.findByText(/Selecciona al menos 1 imagen\./i);
    expect(aviso).toBeTruthy();
  });
});
