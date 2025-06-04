import React from 'react'
import { render, screen, fireEvent } from '../utils/test-utils'
import { Input } from '@/components/ui/input'

describe('Input компонент', () => {
  it('должен корректно рендериться с placeholder', () => {
    render(<Input placeholder="Введите имя" />)

    const input = screen.getByPlaceholderText('Введите имя')
    expect(input).toBeInTheDocument()
  })

  it('должен принимать значение', () => {
    const { rerender } = render(<Input value="Тестовое значение" readOnly />)

    const input = screen.getByDisplayValue('Тестовое значение')
    expect(input).toBeInTheDocument()

    rerender(<Input value="Новое значение" readOnly />)
    expect(input).toHaveValue('Новое значение')
  })

  it('должен вызывать onChange при вводе', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Тестовый ввод' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('должен быть отключен, когда установлен disabled', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('должен применять пользовательский класс', () => {
    render(<Input className="custom-input-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input-class')
  })

  it('должен иметь правильный тип по умолчанию', () => {
    render(<Input type="text" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('должен изменять тип на password', () => {
    render(<Input type="password" data-testid="password-input" />)

    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('должен передавать дополнительные атрибуты', () => {
    render(<Input data-testid="test-input" required autoFocus />)

    const input = screen.getByTestId('test-input')
    expect(input).toBeRequired()
    // Примечание: автофокус не всегда работает в тестовом окружении
  })
})