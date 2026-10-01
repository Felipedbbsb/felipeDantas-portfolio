# Felipe Dantas Borges — Portfolio

Portfólio pessoal de Felipe Dantas Borges, com projetos de desenvolvimento de jogos, programação e design.

Site: <https://felipedbbsb.github.io/felipeDantas-portfolio/>

Versão em português: <https://felipedbbsb.github.io/felipeDantas-portfolio/pt/>

## Como adicionar um projeto

Você só precisa fazer três coisas:

1. Colocar a imagem em `public/assets/projects/`.
2. Adicionar um bloco de projeto em `src/data.js`.
3. Enviar as alterações para o GitHub.

O projeto aparecerá automaticamente no site em inglês, no site em português e nos PDFs.

### 1. Adicione a imagem

Use uma imagem `.jpg` ou `.png`. Prefira uma imagem horizontal com proporção próxima de `1.6:1` e pelo menos 1200 px de largura. A mesma composição será usada no site e no PDF.

Exemplo:

```text
public/assets/projects/meu-jogo.jpg
```

### 2. Copie este modelo

Adicione o bloco abaixo dentro da lista `projects` em `src/data.js`:

```js
{
  title: bilingual('My Game', 'Meu Jogo'),
  media: {
    source: 'meu-jogo.jpg',
    printSource: 'meu-jogo.jpg',
    fit: 'cover',
    printFit: 'cover',
    position: 'center',
    printPosition: 'center'
  },
  description: bilingual(
    'A short description in English.',
    'Uma descrição curta em português.'
  ),
  tags: ['Unity', 'C#'],
  tone: 'cyan',
  links: [
    { label: 'GitHub', url: 'https://github.com/...' },
    { label: 'Itch.io', url: 'https://itch.io/...' }
  ]
}
```

Preencha sempre os dois idiomas. `tone` controla a cor e o gradiente do card nos dois formatos. Quando uma imagem precisar de outro enquadramento no PDF, adicione um arquivo específico em `printSource` e ajuste `printPosition`. Se não houver um link, use uma lista vazia:

```js
links: []
```

O modelo pronto também está em [`docs/project-template.js`](docs/project-template.js).

### 3. Veja antes de publicar

Para conferir o resultado no computador:

```bash
npm run serve
```

Depois abra <http://localhost:4173>.

Para verificar se a imagem, os textos e os links do projeto estão corretos:

```bash
npm run check
```

### 4. Publique

```bash
git add .
git commit -m "feat: add my game to portfolio"
git push
```

O GitHub Pages publica a alteração automaticamente depois do `push`.

## PDF

O botão `Download PDF` baixa diretamente a versão correspondente ao idioma atual. Os links continuam clicáveis no arquivo.

Para gerar os dois arquivos diretamente:

```bash
npm install
npx playwright install chromium
npm run pdf
```

Os arquivos aparecem em:

```text
public/downloads/felipe-dantas-borges-en.pdf
public/downloads/felipe-dantas-borges-pt.pdf
```

## Onde editar cada parte

| O que você quer mudar | Arquivo |
| --- | --- |
| Projetos, imagens, descrições e links | `src/data.js` |
| Textos gerais em inglês e português | `src/data.js` |
| Cores, fontes e animações | `src/styles.css` |
| Fundo procedural e seus parâmetros | `src/shader.js` |
| Estrutura compartilhada dos cards | `src/project-card.js` |
| Cores e gradientes dos cards | `src/project-tokens.css` |
| Layout do currículo PDF | `src/print.css` e `src/print-render.js` |

Se você adicionar projetos com o modelo acima, não precisa editar os componentes da página.

## Personalizar o shader

Os principais controles ficam no início de `src/shader.js`, em `SHADER_CONFIG`:

```js
speed: 0.045,     // velocidade do movimento
intensity: 0.42,  // força das cores
warp: 0.82,       // deformação do campo
contrast: 1.18,   // contraste
grain: 0.025      // granulação
```

As cores ficam em `palette`. Você pode trocar os valores RGB e publicar novamente sem mexer no restante do shader.
