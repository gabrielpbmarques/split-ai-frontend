# 🌊 Liquid Glass Design System

Uma biblioteca de componentes moderna inspirada no design liquid glass do iOS 26, criada para o projeto Split AI Frontend.

## 🎨 Características

- **Efeito Liquid Glass**: Componentes com transparência, blur e reflexos
- **Design Tokens Centralizados**: Sistema consistente de cores, espaçamentos e efeitos
- **Animações Fluidas**: Transições suaves e efeitos de hover elegantes
- **Responsivo**: Componentes adaptáveis a diferentes tamanhos de tela
- **Acessível**: Seguindo boas práticas de acessibilidade
- **TypeScript**: Totalmente tipado para melhor DX

## 📦 Componentes Disponíveis

### LiquidCard
Cartão com efeito glass morphism e variantes personalizáveis.

```tsx
import { LiquidCard } from '@/lib/design-system';

<LiquidCard variant="primary" size="md" radius="lg" shadow="md">
  Conteúdo do card
</LiquidCard>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'tertiary'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `radius`: 'sm' | 'md' | 'lg' | 'xl' | 'liquid'
- `shadow`: 'sm' | 'md' | 'lg' | 'liquid' | 'neon'
- `animation`: 'float' | 'shimmer' | 'morph' | 'reflect'

### LiquidButton
Botão com efeitos glass e animações interativas.

```tsx
import { LiquidButton } from '@/lib/design-system';

<LiquidButton 
  variant="primary" 
  size="md" 
  shape="default"
  glow={true}
  shimmer={true}
>
  Clique aqui
</LiquidButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'destructive'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `shape`: 'default' | 'round' | 'liquid'
- `glow`: boolean - Adiciona efeito neon
- `shimmer`: boolean - Adiciona efeito shimmer no hover

### LiquidInput
Campo de entrada com design glass e ícones opcionais.

```tsx
import { LiquidInput } from '@/lib/design-system';
import { Search } from 'lucide-react';

<LiquidInput 
  variant="default"
  inputSize="md"
  glow={false}
  icon={<Search />}
  iconPosition="left"
  placeholder="Digite aqui..."
/>
```

**Props:**
- `variant`: 'default' | 'filled' | 'ghost'
- `inputSize`: 'sm' | 'md' | 'lg'
- `glow`: boolean
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'

### LiquidModal
Modal com backdrop blur e animações de entrada.

```tsx
import { LiquidModal } from '@/lib/design-system';

<LiquidModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título do Modal"
  description="Descrição opcional"
  size="md"
  showCloseButton={true}
  closeOnOverlayClick={true}
>
  Conteúdo do modal
</LiquidModal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (opcional)
- `description`: string (opcional)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean
- `closeOnOverlayClick`: boolean

### LiquidAvatar
Avatar com efeitos glass e indicador de status.

```tsx
import { LiquidAvatar } from '@/lib/design-system';

<LiquidAvatar
  src="/avatar.jpg"
  alt="Avatar do usuário"
  size="md"
  variant="glass"
  shape="circle"
  online={true}
  fallback={<User />}
/>
```

**Props:**
- `src`: string (opcional)
- `alt`: string (opcional)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `variant`: 'default' | 'glass' | 'glow'
- `shape`: 'circle' | 'square' | 'liquid'
- `online`: boolean (opcional)
- `fallback`: React.ReactNode (opcional)

### LiquidBadge
Badge com efeitos glass e variantes coloridas.

```tsx
import { LiquidBadge } from '@/lib/design-system';

<LiquidBadge
  variant="success"
  size="md"
  shape="pill"
  glow={true}
  pulse={false}
>
  Online
</LiquidBadge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `shape`: 'default' | 'pill' | 'liquid'
- `glow`: boolean
- `pulse`: boolean

### LiquidLoader
Loader com diferentes variantes de animação.

```tsx
import { LiquidLoader } from '@/lib/design-system';

<LiquidLoader
  variant="orbital"
  size="md"
  color="primary"
  text="Carregando..."
/>
```

**Props:**
- `variant`: 'spinner' | 'dots' | 'pulse' | 'orbital'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'secondary' | 'accent'
- `text`: string (opcional)

## 🎯 Design Tokens

### Espaçamentos
```tsx
const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}
```

### Border Radius
```tsx
const borderRadius = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  liquid: '60% 40% 30% 70% / 60% 30% 70% 40%',
}
```

### Blur
```tsx
const blur = {
  sm: '10px',
  md: '20px',
  lg: '40px',
  xl: '60px',
}
```

## 🚀 Uso Rápido

1. **Importe os componentes:**
```tsx
import { 
  LiquidCard, 
  LiquidButton, 
  LiquidInput 
} from '@/lib/design-system';
```

2. **Use as classes CSS utilitárias:**
```tsx
<div className="liquid-glass rounded-2xl p-6">
  <div className="liquid-gradient-primary p-4">
    <h2 className="shimmer">Título com efeito</h2>
  </div>
</div>
```

3. **Aplique animações:**
```tsx
<div className="animate-float liquid-morph glass-reflect">
  Elemento com múltiplas animações
</div>
```

## 🎨 Classes CSS Utilitárias

### Liquid Glass
- `.liquid-glass` - Efeito glass básico
- `.liquid-glass-strong` - Efeito glass mais intenso
- `.liquid-glass-tertiary` - Variante terciária

### Gradientes
- `.liquid-gradient-primary` - Gradiente azul/roxo
- `.liquid-gradient-secondary` - Gradiente verde/azul
- `.liquid-gradient-accent` - Gradiente amarelo/vermelho
- `.mesh-bg` - Background com mesh gradient

### Animações
- `.animate-float` - Animação flutuante
- `.animate-shimmer` - Efeito shimmer
- `.liquid-morph` - Morphing líquido
- `.glass-reflect` - Reflexo de vidro

### Sombras
- `.shadow-glass` - Sombra glass básica
- `.shadow-glass-lg` - Sombra glass grande
- `.shadow-liquid` - Sombra liquid com glow interno
- `.shadow-neon` - Sombra neon colorida

## 🌙 Suporte a Dark Mode

Todos os componentes suportam automaticamente dark mode através das CSS variables definidas no sistema. As cores e opacidades se ajustam automaticamente baseado na classe `.dark` no elemento raiz.

## 🔧 Customização

Para customizar os tokens, edite o arquivo `src/lib/design-system/tokens/index.ts`:

```tsx
export const liquidGlassTokens = {
  // Seus tokens customizados aqui
  spacing: {
    // Customizar espaçamentos
  },
  colors: {
    // Customizar cores
  }
}
```

## 📱 Responsividade

Todos os componentes são responsivos por padrão. Use as classes do Tailwind para ajustes específicos:

```tsx
<LiquidCard 
  size="sm" 
  className="md:size-lg lg:size-xl"
>
  Card responsivo
</LiquidCard>
```

## ♿ Acessibilidade

- Todos os componentes seguem as diretrizes WCAG 2.1
- Suporte completo a navegação por teclado
- Indicadores de foco visíveis
- Textos alternativos apropriados
- Contraste adequado de cores

## 🤝 Contribuindo

Para contribuir com novos componentes ou melhorias:

1. Crie o componente em `src/lib/design-system/components/`
2. Adicione os tipos necessários
3. Exporte no arquivo `index.ts`
4. Adicione documentação neste README
5. Teste a acessibilidade e responsividade

---

**Desenvolvido com ❤️ para o Split AI Frontend**
