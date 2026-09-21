import { useTheme } from '../hooks/useTheme'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { tema, alternar } = useTheme()
  const esOscuro = tema === 'oscuro'

  return (
    <Button
      variante="fantasma"
      onClick={alternar}
      aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={esOscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {esOscuro ? '☀' : '☾'}
      </span>
    </Button>
  )
}
