import React from 'react'
import { render, screen } from '../utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button компонент', () => {
  it('должен корректно рендериться с текстом', () => {
    render(<Button>Тестовая кнопка</Button>)

    const button = screen.getByRole('button', { name: /тестовая кнопка/i })
    expect(button).toBeInTheDocument()
  })

  it('должен применять класс для варианта destructive', () => {
    render(<Button variant="destructive">Удалить</Button>)

    const button = screen.getByRole('button', { name: /удалить/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('должен применять класс для варианта outline', () => {
    render(<Button variant="outline">Контур</Button>)

    const button = screen.getByRole('button', { name: /контур/i })
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('bg-background')
  })

  it('должен применять класс для размера sm', () => {
    render(<Button size="sm">Маленькая кнопка</Button>)

    const button = screen.getByRole('button', { name: /маленькая кнопка/i })
    expect(button).toHaveClass('h-8')
  })

  it('должен применять класс для размера lg', () => {
    render(<Button size="lg">Большая кнопка</Button>)

    const button = screen.getByRole('button', { name: /большая кнопка/i })
    expect(button).toHaveClass('h-10')
  })

  it('должен применять пользовательский класс', () => {
    render(<Button className="custom-class">Кастомный класс</Button>)

    const button = screen.getByRole('button', { name: /кастомный класс/i })
    expect(button).toHaveClass('custom-class')
  })

  it('должен передавать дополнительные атрибуты', () => {
    render(<Button data-testid="test-button" disabled>Отключена</Button>)

    const button = screen.getByTestId('test-button')
    expect(button).toBeDisabled()
  })

  it('должен вызывать обработчик клика', () => {
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Кликни меня</Button>)

    const button = screen.getByRole('button', { name: /кликни меня/i })
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})