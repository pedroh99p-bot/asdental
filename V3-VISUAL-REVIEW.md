# AS Dental — revisão visual da V3

Revisão da implementação anterior, seguida de correções no HTML, CSS e JavaScript existentes. Os assets V2 foram preservados. Os exemplos continuam restritos ao modo de prévia.

| Seção | Diagnóstico | Correção aplicada |
| --- | --- | --- |
| Navbar | O X podia ficar atrás do drawer; links do menu fechado continuavam disponíveis ao foco. A âncora Início apontava para um header sticky. | Toggle acima do drawer, menu fechado com `inert`, foco incluindo o botão de fechar, Escape e âncora no início do documento. |
| Hero | A legenda da foto participava do flex e empurrava o conteúdo. Título excessivamente grande e sobre os rostos. | Área exclusiva para fotografia, coluna de texto alinhada ao container, escala tipográfica menor e legenda posicionada sobre a mídia. No celular, CTAs precedem a fotografia. |
| Badge Google | Variante compacta pequena e com pouco respiro. | Superfície branca, marca, estrelas e aviso em linhas legíveis. Sem nota ou quantidade inventada. |
| Tratamentos | A estrutura dos cards funcionava; o ritmo dependia dos espaçamentos gerais. | Mantidos ícones, hierarquia e CTA contextual, com espaçamentos compartilhados e quebra responsiva. |
| Marquees | No modo de movimento reduzido, viravam uma frase corrida com ponto e vírgula. | Composição estática com os mesmos termos e separadores. Movimento normal com direções alternadas e grupos duplicados. |
| Diferenciais | Coluna de introdução sticky criava posições inconsistentes durante a navegação. | Introdução estática alinhada à lista; linhas e ornamentos preservados. |
| Como funciona | Texto de configuração técnica aparecia como parte principal da jornada. | Copy orientada à conversa com a equipe. Pendência do Simples Dental informada ao interagir com o CTA da prévia. |
| Galeria | Título longo dominava a seção. | Título mais curto, proporções definidas e legendas visíveis sobre as imagens ilustrativas. |
| Equipe | Cards encostados à esquerda com grande vazio lateral. Recortes mostravam partes de outros rostos. | Dois cards centralizados no desktop; enquadramentos individuais por CSS sobre a foto composta; swipe, setas e indicadores no mobile. |
| Avaliações | Terceiro card cortado no desktop e barra de rolagem chamativa. O CSS fazia um link marcado como `hidden` aparecer sem URL. | Três cards completos no desktop, scroll nativo no mobile, controles condicionais e regra global de `hidden`. Link Google continua oculto sem ficha validada. |
| Localização | A referência geral já estava identificada, mas precisava ser confirmada em navegador. | Iframe real carregado sob demanda, estado de carregamento, rota externa e aviso de que o ponto é o shopping. |
| FAQ e assistente | O botão do FAQ abria e fechava o painel no mesmo clique por causa do listener de clique externo. | Gatilho excluído do fechamento externo; abertura, Escape e respostas testados. Pill permanece legível no mobile e some durante o drawer. |
| CTA final e footer | Estrutura aproveitável, com necessidade de uniformizar ritmo e área segura. | Escala do título ajustada, logo central mantida, colunas consistentes e espaço inferior para o assistente. |
| Páginas internas | Classes como `page-hero`, `section-soft` e `prose` não tinham estilos. | Cabeçalhos, textos e layouts internos definidos, com colunas empilhadas no mobile. |

## Validações realizadas

- Inspeção visual da homepage por seção no navegador, incluindo hero em desktop, tablet e celular; retratos individuais; reviews; galeria; mapa; FAQ e footer.
- Medição após renderização em 360, 375, 390, 430, 768, 1024 e 1440 px: largura do documento igual à área disponível, sem overflow horizontal.
- Páginas `about.html`, `services.html`, `team.html` e `contact.html` medidas em 390 e 1440 px, sem overflow. Composição visual das páginas internas também inspecionada.
- Carrosséis: avanço por botão e deslocamento real confirmados no mobile. Scroll Snap e teclado preservados.
- Menu: X visível, Escape, retorno de foco, Shift+Tab para fechar e menu fechado inerte confirmados.
- Âncora Início retornou a `scrollY = 0`.
- FAQ abriu o assistente e Escape o fechou.
- CTAs de prévia exibiram as pendências corretas sem abrir WhatsApp ou simular agendamento.
- Google Maps carregou e mostrou o Shopping Nova América no iframe.
- `?preview=0`: zero perfis, depoimentos, badges ou banner de demonstração; canais pendentes desativados.
- Console da aplicação sem erros ou avisos durante a revisão local.
- `node --check`, lint estático das cinco páginas e `git diff --check` executados antes da publicação.

O navegador usado estava com movimento reduzido ativo. As composições estáticas foram verificadas nessa condição; a lógica de reveal e os keyframes normais foram inspecionados no código. Não foi executado Lighthouse nem teste de campo de Core Web Vitals.

## Pendências comerciais preservadas

A ficha Google, avaliações reais, profissionais, credenciais, sala da clínica e canal de WhatsApp continuam aguardando confirmação. O link do Simples Dental permanece ausente. Nenhum destino comercial ou dado clínico foi inventado para preencher essas pendências.

Prévia completa: `?preview=1`. Modo público local: `?preview=0`.
