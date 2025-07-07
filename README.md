# Genutra - Plataforma de Nutrição Inteligente

Plataforma web responsiva voltada para nutricionistas, com foco em automatizar a geração de planos alimentares personalizados com inteligência artificial.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **CSS Modules** - Estilização modular
- **Vercel** - Deploy e hospedagem

## 🎨 Design System

### Cores
- **Azul Primário**: #3366FF
- **Azul Secundário**: #EBF1FF
- **Texto Escuro**: #1A1A1A
- **Texto Cinza**: #6B7280
- **Fundo Claro**: #F9FAFB
- **Erro**: #EF4444
- **Sucesso**: #10B981

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── page.module.css    # Estilos da página inicial
├── components/            # Componentes reutilizáveis
│   └── Button/           # Componente Button
├── styles/               # Estilos globais
│   └── globals.css       # CSS variables e reset
├── lib/                  # Utilitários e configurações
└── types/                # Definições de tipos TypeScript
```

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel:

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente necessárias
3. Deploy automático a cada push para a branch principal

## 📋 Funcionalidades Planejadas

- [ ] Sistema de autenticação
- [ ] Formulário de anamnese nutricional
- [ ] Geração automática de planos com IA
- [ ] Editor de planos alimentares
- [ ] Exportação em PDF
- [ ] Histórico de pacientes
- [ ] Envio por WhatsApp
- [ ] Sistema de planos e monetização

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Email**: contato@genutra.com.br
- **Website**: [genutra.com.br](https://genutra.com.br) 