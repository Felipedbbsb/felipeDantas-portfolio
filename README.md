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

Use uma imagem `.jpg` ou `.png`. Prefira uma imagem horizontal, com pelo menos 1200 px de largura.

Exemplo:

```text
public/assets/projects/meu-jogo.jpg
```

### 2. Copie este modelo

Adicione o bloco abaixo dentro da lista `projects` em `src/data.js`:

```js
{
  year: '2026',
  title: bilingual('My Game', 'Meu Jogo'),
  type: bilingual('Action game', 'Jogo de ação'),
  image: 'meu-jogo.jpg',
  description: bilingual(
    'A short description in English.',
    'Uma descrição curta em português.'
  ),
  tags: ['Unity', 'C#'],
  links: [
    { label: 'GitHub', url: 'https://github.com/...' },
    { label: 'Itch.io', url: 'https://itch.io/...' }
  ]
}
```

Preencha sempre os dois idiomas. Se não houver um link, use uma lista vazia:

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

O botão `PDF / resume` ou `PDF / currículo` abre a versão de impressão e o navegador mostra a opção de salvar como PDF. Os links continuam clicáveis no arquivo salvo.

Para gerar os dois arquivos diretamente:

```bash
npm install
npx playwright install chromium
npm run pdf
```

Os arquivos aparecem em:

```text
dist/felipe-dantas-borges-en.pdf
dist/felipe-dantas-borges-pt.pdf
```

## Onde editar cada parte

| O que você quer mudar | Arquivo |
| --- | --- |
| Projetos, imagens, descrições e links | `src/data.js` |
| Textos gerais em inglês e português | `src/data.js` |
| Cores, fontes e animações | `src/styles.css` |
| Fundo procedural e seus parâmetros | `src/shader.js` |
| Conteúdo do currículo PDF | `print.html` |

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
