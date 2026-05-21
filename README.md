# Ita Coatiara - Venda de Usados

Site de classificados para venda de itens usados. Desenvolvido com HTML, CSS e JavaScript puro, compatível com GitHub Pages.

## Estrutura do Projeto

```
├── index.html                 # Página inicial com grade de produtos
├── item.html                  # Página de detalhes do produto
├── css/
│   └── style.css             # Estilos CSS
├── js/
│   └── script.js             # Lógica JavaScript
├── data/
│   ├── parametros.csv        # Configurações do site
│   ├── coisas.csv            # Produtos à venda
│   ├── fotos_coisa.csv       # Fotos dos produtos
│   ├── contatos_coisa.csv    # Contatos dos vendedores
│   ├── agrupamentos_coisas.csv # Combos e relacionamentos
│   ├── secoes.csv            # Seções de informações
│   └── infos_secao.csv       # Informações dentro das seções
├── images/
│   └── logo.png              # Logo do site
└── [pasta_produtos]/          # Pastas com imagens dos produtos
    ├── foto1.jpg
    ├── foto2.jpg
    └── ...
```

## Como Usar

### 1. Preparar os Dados CSV

Edite os arquivos na pasta `data/` conforme necessário:

- **parametros.csv**: Nome do site, telefones, links de redes sociais
- **coisas.csv**: Informações dos produtos (título, preço, quantidade, etc)
- **fotos_coisa.csv**: Fotos e legendas de cada produto
- **contatos_coisa.csv**: Informações de contato dos vendedores
- **agrupamentos_coisas.csv**: Combos e descontos associados
- **secoes.csv**: Seções de informações adicionais
- **infos_secao.csv**: Dados dentro de cada seção

### 2. Adicionar Imagens

1. Crie uma pasta para cada produto na raiz do site
2. Coloque as imagens dentro dessas pastas
3. Referencie o nome da pasta em `coisas.csv` na coluna `pasta_imagens`

### 3. Adicionar Logo

Substituir ou adicionar a logo em `images/logo.png`

### 4. Deploy no GitHub Pages

1. Faça push de todo o conteúdo para o repositório
2. Vá em Settings > Pages
3. Selecione a branch `main` como source
4. O site estará disponível em `https://[username].github.io/itavendas-git`

## Recursos

- ✅ Design minimalista e responsivo
- ✅ Carrossel de imagens interativo
- ✅ Grid de produtos com ajuste automático
- ✅ Sistema de combos e descontos
- ✅ Integração com WhatsApp
- ✅ Links para redes sociais
- ✅ Suporte a múltiplas informações por produto
- ✅ Sem dependências externas

## Formatação dos Dados CSV

### Moeda
Todos os valores monetários devem estar em formato numérico (ex: `150.00`)

### Separadores
Os valores nos CSVs são separados por vírgula. Se houver vírgula no texto, coloque o campo entre aspas.

### URLs Externas
Links para Facebook, Instagram e WhatsApp serão abertos em nova aba.
Links internos (entre páginas do site) serão abertos na mesma aba.

## Dúvidas e Ajustes

Para qualquer dúvida sobre a estrutura ou funcionamento, verifique os arquivos de exemplo fornecidos.
